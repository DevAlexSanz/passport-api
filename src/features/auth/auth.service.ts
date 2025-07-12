import { inject, injectable } from 'tsyringe';
import { UserRepository } from '@features/user/user.repository';
import { PharmacyRepository } from '@features/pharmacy/pharmacy.repository';
import { ConflictException } from '@exceptions/conflict-exception';
import { hashPassword } from '@utils/bcrypt';
import { CreateUser } from '@appTypes/User';
import { Role } from '@shared/constants/Role';
import { CreateAdminWithPharmacyDTO } from './dto/create-pharmacy.dto';
import { generateCodeVerified } from '@utils/generate-code-verified';

@injectable()
export class AuthService {
  constructor(
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(PharmacyRepository)
    private readonly pharmacyRepository: PharmacyRepository
  ) {}

  private async createUser({ email, password, role }: CreateUser) {
    const userExists = await this.userRepository.findOne({
      email,
    });

    if (userExists) throw new ConflictException('Email already registered');

    const hashedPassword = await hashPassword(password);

    const codeVerification = generateCodeVerified();

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      role,
      codeVerification,
    });

    return {
      user,
      codeVerification,
    };
  }

  async registerUser({ email, password }: { email: string; password: string }) {
    const { codeVerification } = await this.createUser({
      email,
      password,
      role: Role.USER,
    });

    return codeVerification;
  }

  async registerAdminWithPharmacy(pharmacy: CreateAdminWithPharmacyDTO) {
    const { user, codeVerification } = await this.createUser({
      email: pharmacy.email,
      password: pharmacy.password,
      role: Role.ADMIN,
    });

    await this.pharmacyRepository.create({
      name: pharmacy.name,
      description: pharmacy.description,
      profilePhoto: '',
      coverPhoto: 'coverPhotoUrl',
      address: pharmacy.address,
      phone: pharmacy.phone,
      email: pharmacy.email,
      userId: user.id,
    });

    return codeVerification;
  }
}
