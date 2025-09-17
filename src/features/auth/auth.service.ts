import { inject, injectable } from 'tsyringe';
import { UserRepository } from '@features/user/user.repository';
import { PharmacyRepository } from '@features/pharmacy/pharmacy.repository';
import { ConflictException } from '@exceptions/conflict.exception';
import { comparePassword, hashPassword } from '@utils/bcrypt';
import { CreateUser } from '@appTypes/User';
import { Role } from '@shared/constants/Role';
import { Role as RoleType } from '@appTypes/Role';
import { CreateAdminWithPharmacyDTO } from './dto/create-pharmacy.dto';
import { generateCodeVerified } from '@utils/generate-code-verified';
import { ForbiddenException } from '@shared/exceptions/forbidden.exception';
import { NotFoundException } from '@shared/exceptions/not-found.exception';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { generateToken } from '@shared/utils/jwt';
import { uploadToCloudinary } from '@shared/utils/cloudinary';
import { sendEmail } from '@utils/nodemailer';
import {
  getVerificationCodeExpiry,
  isExpired,
} from '@utils/getVerificationCodeExpiry';
import { TooManyRequestsException } from '@exceptions/too-many-requests.exception';
import { AccountRepository } from '@features/account/account.repository';
import { prisma } from '@database/prisma';

@injectable()
export class AuthService {
  constructor(
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(PharmacyRepository)
    private readonly pharmacyRepository: PharmacyRepository,
    @inject(AccountRepository)
    private readonly accountRepository: AccountRepository
  ) {}

  private generateCodeVerification() {
    const codeVerification = generateCodeVerified();
    const codeVerificationExpiresAt = getVerificationCodeExpiry();

    return {
      codeVerification,
      codeVerificationExpiresAt,
    };
  }

  private async createUser({ email, password, role }: CreateUser) {
    const userExists = await this.userRepository.findOne({
      email,
    });

    const roleData = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!roleData) throw new NotFoundException('Role not found');

    if (userExists) throw new ConflictException('Email already registered');

    const hashedPassword = await hashPassword(password);

    const { codeVerification, codeVerificationExpiresAt } =
      this.generateCodeVerification();

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      roleId: roleData.id,
      codeVerification,
      codeVerificationExpiresAt,
    });

    await sendEmail({
      email,
      title: 'Verify your DaVida account',
      description: 'Use the code below to verify your account.',
      code: codeVerification,
    });

    return {
      user,
    };
  }

  async registerUser({ email, password }: { email: string; password: string }) {
    await this.createUser({
      email,
      password,
      role: Role.USER,
    });
  }

  async registerAdminWithPharmacy(
    pharmacy: CreateAdminWithPharmacyDTO,
    profilePhoto: Express.Multer.File,
    coverPhoto: Express.Multer.File
  ) {
    const { user } = await this.createUser({
      email: pharmacy.email,
      password: pharmacy.password,
      role: Role.ADMIN,
    });

    const profilePhotoUrl = await uploadToCloudinary(
      profilePhoto,
      'profile-photos'
    );

    const coverPhotoUrl = await uploadToCloudinary(coverPhoto, 'cover-photos');

    await this.pharmacyRepository.create({
      name: pharmacy.name,
      description: pharmacy.description,
      profilePhoto: profilePhotoUrl.secure_url,
      coverPhoto: coverPhotoUrl.secure_url,
      address: pharmacy.address,
      phone: pharmacy.phone,
      email: pharmacy.email,
      userId: user.id,
    });
  }

  async authenticateUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await this.userRepository.findOne({
      email,
    });

    if (!user || !user.email || !user.password)
      throw new NotFoundException('User not found or user only with OAuth');

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload: {
      id: string;
      email: string;
      role: string;
      pharmacyId?: string;
    } = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };

    if (user.pharmacy) {
      payload.pharmacyId = user.pharmacy.id;
    }

    const { accessToken, refreshToken } = generateToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getMe(id: string, role: RoleType) {
    const user = await this.userRepository.findOne({ id });

    if (!user) throw new NotFoundException('User not found');

    if (role === Role.ADMIN) {
      const pharmacy = await this.pharmacyRepository.findByUserId(user.id);

      return {
        id: user.id,
        email: user.email,
        role: user.role.name,
        isVerified: user.isVerified,
        pharmacy,
      };
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  async verifyAccount({ id, code }: { id: string; code: number }) {
    const user = await this.userRepository.findOne({ id });

    if (!user || !user.email) throw new NotFoundException('User not found');

    if (!user.codeVerificationExpiresAt) {
      throw new ForbiddenException('Verification expiration not set');
    }

    if (isExpired(user.codeVerificationExpiresAt)) {
      throw new ForbiddenException(
        'The verification code you entered is incorrect or has expired. Please request a new one.'
      );
    }

    if (user.codeVerification !== code)
      throw new ForbiddenException('Invalid code');

    await this.userRepository.update(user.id, {
      isVerified: true,
      codeVerification: null,
    });

    await sendEmail({
      email: user.email,
      title: 'Your account has been verified!',
      description: 'You now have full access to DaVida.',
    });
  }

  async resendCodeVerification(id: string) {
    const user = await this.userRepository.findOne({ id });

    if (!user || !user.email)
      throw new NotFoundException('User not found or email not set');

    if (user.isVerified) throw new ConflictException('Already verified');

    const now = new Date();

    if (
      user.codeVerificationExpiresAt &&
      user.codeVerificationExpiresAt > now
    ) {
      const msRemaining =
        user.codeVerificationExpiresAt.getTime() - now.getTime();

      const minutes = Math.floor(msRemaining / 60000);
      const seconds = Math.floor((msRemaining % 60000) / 1000);

      throw new TooManyRequestsException(
        `You must wait before requesting another verification code. Time Remaining: ${minutes}m ${seconds}s.`
      );
    }

    const { codeVerification, codeVerificationExpiresAt } =
      this.generateCodeVerification();

    await this.userRepository.update(id, {
      codeVerification,
      codeVerificationExpiresAt,
    });

    await sendEmail({
      email: user.email,
      title: 'Here’s your new DaVida code',
      description:
        'Use the code below to finish verifying your account. This replaces any previous code.',
      code: codeVerification,
    });
  }

  async refreshAccessToken(id: string) {
    const user = await this.userRepository.findOne({ id });

    if (!user || !user.email) throw new NotFoundException('User not found');

    const { accessToken } = generateToken({
      id: user.id,
      email: user.email,
      role: user.role.name,
    });

    return {
      accessToken,
    };
  }

  async validateOrCreateUser(
    profile: any,
    accessToken: string,
    refreshToken: string
  ) {
    const provider = 'google';
    const providerAccountId = profile.id;

    const account =
      await this.accountRepository.findByProviderAndProviderAccountId(
        provider,
        providerAccountId
      );

    if (account) return account.user;

    const email = profile.emails?.[0]?.value;

    const userExists = await this.userRepository.findOne({
      email,
    });

    if (userExists) throw new ConflictException('Email already registered');

    const roleData = await prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (!roleData) throw new NotFoundException('Role not found');

    const user = await this.userRepository.createWithAccount({
      email,
      roleId: roleData.id,
      account: {
        provider,
        providerAccountId,
        accessToken,
        refreshToken,
      },
    });

    return user;
  }
}
