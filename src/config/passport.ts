import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '@config/config';
import { prisma } from '@database/prisma';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const provider = 'google';
        const providerAccountId = profile.id;

        let account = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
          include: { user: true },
        });

        if (!account) {
          const email = profile.emails?.[0]?.value;

          const user = await prisma.user.create({
            data: {
              email,
              isVerified: true,
              role: 'USER',
              accounts: {
                create: {
                  provider,
                  providerAccountId,
                  accessToken: _accessToken,
                  refreshToken: _refreshToken,
                },
              },
            },
          });

          return done(null, user);
        }

        return done(null, account.user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
