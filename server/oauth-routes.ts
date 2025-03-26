import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { isProviderConfigured, oauthProviders, getEnabledProviders } from './oauth-config';

export function setupOAuthRoutes(app: Express) {
  // API endpoint to get enabled OAuth providers
  app.get('/api/auth/providers', (req, res) => {
    const providers = getEnabledProviders();
    res.json({ providers });
  });
  
  // API endpoint to get the current authenticated user
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
  
  // API endpoint for logging out
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error during logout' });
      }
      res.json({ success: true });
    });
  });

  // Google OAuth routes
  if (isProviderConfigured('google')) {
    app.get('/api/auth/google', passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    }));

    app.get('/api/auth/google/callback', 
      passport.authenticate('google', { 
        failureRedirect: '/auth?error=google-auth-failed'
      }),
      (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
      }
    );
  }

  // Facebook OAuth routes
  if (isProviderConfigured('facebook')) {
    app.get('/api/auth/facebook', passport.authenticate('facebook', {
      scope: ['email', 'public_profile']
    }));

    app.get('/api/auth/facebook/callback',
      passport.authenticate('facebook', {
        failureRedirect: '/auth?error=facebook-auth-failed'
      }),
      (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
      }
    );
  }

  // Apple OAuth routes
  if (isProviderConfigured('apple')) {
    app.get('/api/auth/apple', passport.authenticate('apple'));

    app.get('/api/auth/apple/callback',
      passport.authenticate('apple', {
        failureRedirect: '/auth?error=apple-auth-failed'
      }),
      (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
      }
    );
  }

  // Microsoft OAuth routes
  if (isProviderConfigured('microsoft')) {
    app.get('/api/auth/microsoft', passport.authenticate('microsoft', {
      scope: ['user.read']
    }));

    app.get('/api/auth/microsoft/callback',
      passport.authenticate('microsoft', {
        failureRedirect: '/auth?error=microsoft-auth-failed'
      }),
      (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
      }
    );
  }

  // Placeholder routes for other providers (for future implementation)
  // These routes will show messages saying keys are not configured

  app.get('/api/auth/x', (req, res) => {
    res.status(501).json({ error: 'X/Twitter authentication not configured yet' });
  });

  app.get('/api/auth/linkedin', (req, res) => {
    res.status(501).json({ error: 'LinkedIn authentication not configured yet' });
  });

  app.get('/api/auth/instagram', (req, res) => {
    res.status(501).json({ error: 'Instagram authentication not configured yet' });
  });

  app.get('/api/auth/tiktok', (req, res) => {
    res.status(501).json({ error: 'TikTok authentication not configured yet' });
  });
}