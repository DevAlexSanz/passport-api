import { injectable } from 'tsyringe';
import { CreateEmployeeDto } from '@features/employee/dto/create-employee.dto';
import { prisma } from '@database/prisma';
import { Role } from '@shared/constants/Role';
import { ConflictException } from '@exceptions/conflict.exception';
import { NotFoundException } from '@exceptions/not-found.exception';
import { hashPassword } from '@utils/bcrypt';

@injectable()
export class EmployeeService {
  async createEmployee(pharmacyId: string, payload: CreateEmployeeDto) {
    const userExists = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (userExists) throw new ConflictException('Email already registered');

    const roleData = await prisma.role.findFirst({
      where: { name: Role.EMPLOYEE },
    });

    if (!roleData) throw new NotFoundException('Role not found');

    const hashedPassword = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        roleId: roleData.id,
        isVerified: true,
      },
    });

    return prisma.employee.create({
      data: {
        pharmacyId,
        userId: user.id,
        firstName: payload.firstName,
        secondName: payload.secondName,
        thirdName: payload.thirdName,
        firstSurname: payload.firstSurname,
        secondSurname: payload.secondSurname,
        dui: payload.dui,
        email: payload.email,
        phone: payload.phone,
      },
    });
  }
}
