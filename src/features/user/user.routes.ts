import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from './user.controller';

const router = Router();

const userController = container.resolve(UserController);

router.get('/', userController.getAllUsers);

export default router;
