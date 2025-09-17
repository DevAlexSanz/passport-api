import { inject, injectable } from 'tsyringe';
import { RoleRepository } from './role.repository';
import { NotFoundException } from '@shared/exceptions/not-found.exception';
import { Role } from '@shared/types/Role';

@injectable()
export class RoleService {
  constructor(
    @inject(RoleRepository) private readonly roleRepository: RoleRepository
  ) {}

  async findByName(name: Role) {
    const role = await this.roleRepository.findByName(name);

    if (!role) throw new NotFoundException('Role not found');

    return role;
  }

  async findById(id: string) {
    const role = await this.roleRepository.findById(id);

    if (!role) throw new NotFoundException('Role not found');

    return role;
  }
}
