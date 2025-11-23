import { container } from 'tsyringe';
import { env } from '@config/config';
import passport, { type Profile, type DoneCallback } from 'passport';
import {
  Strategy as GoogleStrategy,
  type Profile as GoogleProfile,
  type VerifyCallback,
} from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import {
  Strategy as TwitterStrategy,
  type Profile as TwitterProfile,
} from 'passport-twitter';
import {
  Strategy as FacebookStrategy,
  type Profile as FacebookProfile,
} from 'passport-facebook';
import { AuthService } from '../auth.service';

const authService = container.resolve(AuthService);

passport.use(
  'auth-google',
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.API_BASE_URL}/api/auth/google/callback`,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: GoogleProfile,
      done: VerifyCallback
    ) => {
      try {
        if (!profile.emails?.[0]?.value) {
          return done(new Error('Google email not found'), false);
        }

        const user = await authService.validateOrCreateUser(
          profile.emails[0].value,
          'google'
        );

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.use(
  'auth-microsoft',
  new MicrosoftStrategy(
    {
      clientID: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${env.API_BASE_URL}/api/auth/microsoft/callback`,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: DoneCallback
    ) => {
      try {
        if (!profile.emails?.[0]?.value) {
          return done(new Error('Microsoft email not found'), false);
        }

        const user = await authService.validateOrCreateUser(
          profile.emails[0].value,
          'microsoft'
        );

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.use(
  'auth-twitter',
  new TwitterStrategy(
    {
      consumerKey: env.TWITTER_CLIENT_ID,
      consumerSecret: env.TWITTER_CLIENT_SECRET,
      callbackURL: `${env.API_BASE_URL}/api/auth/twitter/callback`,
      includeEmail: true,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: TwitterProfile,
      done: DoneCallback
    ) => {
      try {
        if (!profile.emails?.[0]?.value) {
          return done(new Error('Twitter email not found'), false);
        }

        const user = await authService.validateOrCreateUser(
          profile.emails[0].value,
          'twitter'
        );

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.use(
  'auth-facebook',
  new FacebookStrategy(
    {
      clientID: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${env.API_BASE_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'displayName', 'name'],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: FacebookProfile,
      done: DoneCallback
    ) => {
      try {
        if (!profile.emails?.[0]?.value) {
          return done(new Error('Facebook email not found'), false);
        }

        const user = await authService.validateOrCreateUser(
          profile.emails[0].value,
          'facebook'
        );

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
