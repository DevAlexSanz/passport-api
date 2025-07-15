import { inject, injectable } from 'tsyringe';
import { User } from '@generated/prisma';
import { UserRepository } from './user.repository';

@injectable()
export class UserService {
  constructor(@inject(UserRepository) private userRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
