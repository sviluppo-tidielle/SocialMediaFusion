// Configuration for all supported OAuth providers

interface OAuthProviderConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  profileFields?: string[];
  enabled: boolean;
}

interface OAuthProviders {
  google: OAuthProviderConfig;
  facebook: OAuthProviderConfig;
  apple: OAuthProviderConfig;
  microsoft: OAuthProviderConfig;
}

// Default base URL for callbacks - adjust if your application is hosted elsewhere
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export const oauthProviders: OAuthProviders = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${baseURL}/api/auth/google/callback`,
    enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: `${baseURL}/api/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    enabled: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET)
  },
  apple: {
    clientID: process.env.APPLE_CLIENT_ID || '',
    clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    callbackURL: `${baseURL}/api/auth/apple/callback`,
    enabled: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET)
  },
  microsoft: {
    clientID: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    callbackURL: `${baseURL}/api/auth/microsoft/callback`,
    enabled: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET)
  }
};

/**
 * Check if a specific provider is fully configured with valid credentials
 */
export function isProviderConfigured(provider: keyof typeof oauthProviders): boolean {
  return oauthProviders[provider].enabled;
}

/**
 * Get a list of all configured providers
 */
export function getEnabledProviders(): Array<keyof typeof oauthProviders> {
  return Object.keys(oauthProviders).filter(
    (key) => oauthProviders[key as keyof typeof oauthProviders].enabled
  ) as Array<keyof typeof oauthProviders>;
}

/**
 * Enable a specific provider for testing (useful only in development)
 */
export function enableProvider(provider: keyof typeof oauthProviders): void {
  if (process.env.NODE_ENV !== 'production') {
    oauthProviders[provider].enabled = true;
  }
}