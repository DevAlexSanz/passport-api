import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { container } from 'tsyringe';
import { env } from '@config/config';
import { AuthService } from '@features/auth/auth.service';

const authService = container.resolve(AuthService);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.validateOrCreateUser(
          profile,
          accessToken,
          refreshToken
        );
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
