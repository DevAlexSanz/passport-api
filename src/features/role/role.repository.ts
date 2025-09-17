import { prisma } from '@database/prisma';
import { Role } from '@shared/types/Role';
import { injectable } from 'tsyringe';

@injectable()
export class RoleRepository {
  async findByName(name: Role) {
    return await prisma.role.findUnique({
      where: { name },
    });
  }

  async findById(id: string) {
    return await prisma.role.findUnique({
      where: { id },
    });
  }
}
