import { injectable } from 'tsyringe';
import { ConflictException } from '@exceptions/conflict.exception';
import { comparePassword, hashPassword } from '@utils/bcrypt';
import { CreateUser } from '@appTypes/User';
import { Role } from '@shared/constants/Role';
import { CreateAdminWithPharmacyDTO } from './dto/create-admin-with-pharmacy.dto';
import { generateCodeVerified } from '@utils/generate-code-verified';
import { ForbiddenException } from '@shared/exceptions/forbidden.exception';
import { NotFoundException } from '@shared/exceptions/not-found.exception';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { generateToken } from '@shared/utils/jwt';
import { sendEmail } from '@utils/nodemailer';
import {
  getVerificationCodeExpiry,
  isExpired,
} from '@utils/getVerificationCodeExpiry';
import { TooManyRequestsException } from '@exceptions/too-many-requests.exception';
import { prisma } from '@database/prisma';
import { AuthProvider } from '@database/generated/prisma';
import { uploadToCloudinary } from '@utils/cloudinary';

@injectable()
export class AuthService {
  private generateCodeVerification() {
    const codeVerification = generateCodeVerified();
    const codeVerificationExpiresAt = getVerificationCodeExpiry();

    return {
      codeVerification,
      codeVerificationExpiresAt,
    };
  }

  private async verifyUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  private async createUser({ email, password, role, isVerified }: CreateUser) {
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) throw new ConflictException('Email already registered');

    const roleData = await prisma.role.findFirst({
      where: { name: role },
    });

    if (!roleData) throw new NotFoundException('Role not found');

    const hashedPassword = await hashPassword(password);

    const { codeVerification, codeVerificationExpiresAt } =
      this.generateCodeVerification();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: roleData.id,
        isVerified,
        codeVerification,
        codeVerificationExpiresAt,
      },
    });

    await sendEmail({
      email,
      title: 'Verify your DaVida account',
      description: 'Use the code below to verify your account.',
      code: codeVerification,
    });

    return user;
  }

  async registerUser({ email, password }: { email: string; password: string }) {
    return await this.createUser({
      email,
      password,
      role: Role.USER,
      isVerified: false,
    });
  }

  async registerAdminWithPharmacy(
    pharmacy: CreateAdminWithPharmacyDTO,
    profilePhoto: Express.Multer.File,
    coverPhoto: Express.Multer.File
  ) {
    const user = await this.createUser({
      email: pharmacy.email,
      password: pharmacy.password,
      role: Role.ADMIN,
      isVerified: true,
    });

    const profilePhotoUrl = await uploadToCloudinary(
      profilePhoto,
      'profile-photos'
    );

    const coverPhotoUrl = await uploadToCloudinary(coverPhoto, 'cover-photos');

    return prisma.pharmacy.create({
      data: {
        name: pharmacy.name,
        description: pharmacy.description,
        profilePhoto: profilePhotoUrl.secure_url,
        coverPhoto: coverPhotoUrl.secure_url,
        address: pharmacy.address,
        phone: pharmacy.phone,
        email: pharmacy.email,
        userId: user.id,
      },
    });
  }

  async authenticateUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { pharmacy: true },
    });

    if (!user || !user.password)
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
      role: user.roleId,
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

  async getMe(id: string) {
    const user = await this.verifyUser(id);

    if (['ADMIN', 'EMPLOYEE'].includes(user.role.name)) {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { userId: user.id },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          isVerified: true,
          role: user.role.name,
        },
        pharmacy,
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role.name,
      },
    };
  }

  async verifyAccount({ id, code }: { id: string; code: number }) {
    const user = await this.verifyUser(id);

    if (!user) throw new NotFoundException('User not found');

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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        codeVerification: null,
      },
    });

    await sendEmail({
      email: user.email,
      title: 'Your account has been verified!',
      description: 'You now have full access to DaVida.',
    });
  }

  async resendCodeVerification(id: string) {
    const user = await this.verifyUser(id);

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

    await prisma.user.update({
      where: { id },
      data: {
        codeVerification,
        codeVerificationExpiresAt,
      },
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
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user || !user.email) throw new NotFoundException('User not found');

    const { accessToken } = generateToken({
      id: user.id,
      role: user.role.name,
      email: user.email,
    });

    return {
      accessToken,
    };
  }

  async validateOrCreateUser(email: string, provider: AuthProvider) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.provider === provider) {
        return existingUser;
      }

      throw new ConflictException(
        'Email already registered with another provider'
      );
    }

    const roleData = await prisma.role.findUnique({
      where: { name: Role.USER },
    });

    if (!roleData) throw new NotFoundException('Role not found');

    return prisma.user.create({
      data: {
        email,
        provider,
        roleId: roleData.id,
        isVerified: true,
      },
    });
  }
}
