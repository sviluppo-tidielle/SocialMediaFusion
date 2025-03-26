import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { oauthProviders, isProviderConfigured } from './oauth-config';
import { storage } from './storage';
import { randomBytes } from 'crypto';

// Helper function to create a random username based on email or name
function generateUsername(profile: any): string {
  const baseName = profile.emails?.[0]?.value?.split('@')[0] || 
                  profile.displayName?.replace(/\s+/g, '') || 
                  'user';
  
  // Add random string to ensure uniqueness
  const randomStr = randomBytes(4).toString('hex');
  return `${baseName}_${randomStr}`;
}

// Configure OAuth strategies
export function setupOAuthStrategies() {
  // Google Strategy
  if (isProviderConfigured('google')) {
    passport.use(new GoogleStrategy({
      clientID: oauthProviders.google.clientID,
      clientSecret: oauthProviders.google.clientSecret,
      callbackURL: oauthProviders.google.callbackURL,
      scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await storage.getUserByUsername(profile.emails?.[0]?.value || '');
        
        // If not, create a new user
        if (!user) {
          user = await storage.createUser({
            username: generateUsername(profile),
            password: randomBytes(16).toString('hex'), // random password since login will be via OAuth
            fullName: profile.displayName || '',
            email: profile.emails?.[0]?.value || '',
            profilePicture: profile.photos?.[0]?.value || null,
            bio: `User connected via Google`,
            website: '',
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }));
  }

  // Facebook Strategy
  if (isProviderConfigured('facebook')) {
    passport.use(new FacebookStrategy({
      clientID: oauthProviders.facebook.clientID,
      clientSecret: oauthProviders.facebook.clientSecret,
      callbackURL: oauthProviders.facebook.callbackURL,
      profileFields: oauthProviders.facebook.profileFields
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await storage.getUserByUsername(profile.emails?.[0]?.value || '');
        
        // If not, create a new user
        if (!user) {
          user = await storage.createUser({
            username: generateUsername(profile),
            password: randomBytes(16).toString('hex'), // random password since login will be via OAuth
            fullName: profile.displayName || '',
            email: profile.emails?.[0]?.value || '',
            profilePicture: profile.photos?.[0]?.value || null,
            bio: `User connected via Facebook`,
            website: '',
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }));
  }

  // Apple Strategy
  if (isProviderConfigured('apple')) {
    passport.use(new AppleStrategy({
      clientID: oauthProviders.apple.clientID,
      clientSecret: oauthProviders.apple.clientSecret,
      callbackURL: oauthProviders.apple.callbackURL,
      scope: ['name', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await storage.getUserByUsername(profile.emails?.[0]?.value || '');
        
        // If not, create a new user
        if (!user) {
          user = await storage.createUser({
            username: generateUsername(profile),
            password: randomBytes(16).toString('hex'), // random password since login will be via OAuth
            fullName: profile.displayName || '',
            email: profile.emails?.[0]?.value || '',
            profilePicture: null,
            bio: `User connected via Apple`,
            website: '',
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }));
  }

  // Microsoft Strategy
  if (isProviderConfigured('microsoft')) {
    passport.use(new MicrosoftStrategy({
      clientID: oauthProviders.microsoft.clientID,
      clientSecret: oauthProviders.microsoft.clientSecret,
      callbackURL: oauthProviders.microsoft.callbackURL,
      scope: ['user.read']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await storage.getUserByUsername(profile.emails?.[0]?.value || '');
        
        // If not, create a new user
        if (!user) {
          user = await storage.createUser({
            username: generateUsername(profile),
            password: randomBytes(16).toString('hex'), // random password since login will be via OAuth
            fullName: profile.displayName || '',
            email: profile.emails?.[0]?.value || '',
            profilePicture: null,
            bio: `User connected via Microsoft`,
            website: '',
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }));
  }
}