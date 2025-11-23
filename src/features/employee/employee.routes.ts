import { Router } from 'express';
import { container } from 'tsyringe';
import { EmployeeController } from './employee.controller';
import { validateAccessToken } from '@shared/middlewares/validate-access-token';
import { validateDto } from '@shared/middlewares/validate-dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { requireRole } from '@middlewares/require-role';
import { Role } from '@shared/constants/Role';

const router = Router();

const employeeController = container.resolve(EmployeeController);

router.post(
  '/',
  validateAccessToken,
  requireRole([Role.ADMIN]),
  validateDto(CreateEmployeeDto, 'body'),
  employeeController.create
);

export default router;
