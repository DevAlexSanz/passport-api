import passport from 'passport';
import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../auth.controller';

const router = Router();

const authController = container.resolve(AuthController);

router.get(
  '/google',
  passport.authenticate('auth-google', {
    scope: ['email', 'profile'],
    prompt: 'select_account',
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('auth-google', { session: false }),
  authController.oauthCallback
);

router.get(
  '/microsoft',
  passport.authenticate('auth-microsoft', {
    scope: ['user.read'],
    prompt: 'select_account',
    session: false,
  })
);

router.get(
  '/microsoft/callback',
  passport.authenticate('auth-microsoft', { session: false }),
  authController.oauthCallback
);

router.get(
  '/twitter',
  passport.authenticate('auth-twitter', {
    prompt: 'select_account',
    session: false,
  })
);

router.get(
  '/twitter/callback',
  passport.authenticate('auth-twitter', { session: false }),
  authController.oauthCallback
);

router.get(
  '/facebook',
  passport.authenticate('auth-facebook', {
    prompt: 'select_account',
    session: false,
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('auth-facebook', { session: false }),
  authController.oauthCallback
);

export default router;
