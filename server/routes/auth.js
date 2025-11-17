const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ==================== TRADITIONAL AUTH ROUTES ====================

// Regular signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log("📝 Signup attempt:", { name, email });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists with this email" 
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Note: In production, you should hash passwords!
    });

    console.log("✅ User created:", user.email);
    
    res.status(201).json({ 
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("❌ Signup error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error",
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: "Server error during signup" 
    });
  }
});

// Regular login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("🔐 Login attempt:", email);

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid email or password" 
      });
    }

    // Check password
    // Note: Since you're storing plain text passwords for now
    if (user.password !== password) {
      return res.status(400).json({ 
        message: "Invalid email or password" 
      });
    }

    // Generate token
    const token = generateToken(user);
    
    console.log("✅ Login successful:", user.email);
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      } 
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      message: "Server error during login" 
    });
  }
});

// ==================== OAUTH STRATEGIES ====================

// Enhanced GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://foodanalyser.onrender.com/api/auth/github/callback",
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 GitHub Profile:", profile.id);
        
        // Try to find user by GitHub ID or email
        let user = await User.findOne({
          $or: [
            { githubId: profile.id },
            { email: profile.emails?.[0]?.value }
          ]
        });

        if (!user) {
          console.log("👤 Creating new user from GitHub");
          const email = profile.emails?.[0]?.value || `${profile.username}@users.noreply.github.com`;
          
          user = await User.create({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email: email,
            avatar: profile.photos?.[0]?.value || "",
          });
        } else {
          // Update existing user with GitHub ID if not set
          if (!user.githubId) {
            user.githubId = profile.id;
            await user.save();
          }
          console.log("✅ Existing user found:", user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ GitHub strategy error:", error);
        return done(error, null);
      }
    }
  )
);

// Enhanced Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://foodanalyser.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google Profile:", profile.id);
        
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails?.[0]?.value }
          ]
        });

        if (!user) {
          console.log("👤 Creating new user from Google");
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });
        } else {
          // Update existing user with Google ID if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          console.log("✅ Existing user found:", user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Google strategy error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Enhanced callback handler
const handleAuthCallback = (req, res, provider) => {
  try {
    if (!req.user) {
      throw new Error(`No user data from ${provider}`);
    }

    const token = generateToken(req.user);
    console.log(`✅ ${provider} auth successful for:`, req.user.email);

    // Send to multiple possible origins
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5;
          }
          .success { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="success">
          <h2>✅ Authentication Successful!</h2>
          <p>Welcome, ${req.user.name}!</p>
          <p>You can close this window.</p>
        </div>
        <script>
          (function() {
            const token = '${token}';
            const userData = ${JSON.stringify({
              name: req.user.name,
              email: req.user.email,
              avatar: req.user.avatar
            })};
            
            console.log('Sending auth success message...');
            
            // Try multiple origins
            const origins = [
              'https://foodanalyserr.vercel.app',
              'http://localhost:3000',
              'https://foodanalyser.onrender.com'
            ];
            
            let messageSent = false;
            
            origins.forEach(origin => {
              try {
                window.opener.postMessage({ 
                  type: 'social_auth_success', 
                  token: token,
                  user: userData,
                  provider: '${provider}'
                }, origin);
                console.log('Message sent to:', origin);
                messageSent = true;
              } catch (e) {
                console.log('Failed to send to:', origin);
              }
            });
            
            // Fallback - try without specific origin
            if (!messageSent) {
              try {
                window.opener.postMessage({ 
                  type: 'social_auth_success', 
                  token: token,
                  user: userData,
                  provider: '${provider}'
                }, '*');
                console.log('Fallback message sent');
                messageSent = true;
              } catch (e) {
                console.error('All message attempts failed');
              }
            }
            
            // Close popup after 2 seconds
            setTimeout(() => {
              window.close();
            }, 2000);
            
          })();
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(`❌ ${provider} callback error:`, error);
    res.send(`
      <script>
        window.opener.postMessage({ 
          type: 'social_auth_failure', 
          error: 'Authentication failed: ${error.message}'
        }, '*');
        window.close();
      </script>
    `);
  }
};

// GitHub routes
router.get("/github", passport.authenticate("github"));

router.get(
  "/github/callback",
  passport.authenticate("github", { 
    session: false,
    failureRedirect: '/api/auth/failure'
  }),
  (req, res) => {
    handleAuthCallback(req, res, 'github');
  }
);

// Google routes
router.get("/google", passport.authenticate("google", { 
  scope: ["profile", "email"] 
}));

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false,
    failureRedirect: '/api/auth/failure'
  }),
  (req, res) => {
    handleAuthCallback(req, res, 'google');
  }
);

// Auth failure route
router.get('/failure', (req, res) => {
  console.log('❌ Auth failure reached');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Failed</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #f5f5f5;
        }
        .error { 
          background: white; 
          padding: 30px; 
          border-radius: 10px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          color: #d32f2f;
        }
      </style>
    </head>
    <body>
      <div class="error">
        <h2>❌ Authentication Failed</h2>
        <p>Please try again.</p>
      </div>
      <script>
        window.opener.postMessage({ 
          type: 'social_auth_failure', 
          error: 'Authentication failed. Please try again.'
        }, '*');
        setTimeout(() => {
          window.close();
        }, 3000);
      </script>
    </body>
    </html>
  `);
});

// Test endpoints
router.get("/test-config", (req, res) => {
  res.json({
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ? "✅ Set" : "❌ Missing",
      callbackUrl: "https://foodanalyser.onrender.com/api/auth/github/callback"
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing", 
      callbackUrl: "https://foodanalyser.onrender.com/api/auth/google/callback"
    },
    database: {
      connected: !!User,
      model: User ? "✅ Loaded" : "❌ Missing"
    },
    routes: {
      signup: "✅ /api/auth/signup",
      login: "✅ /api/auth/login"
    }
  });
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "Auth Service" 
  });
});

module.exports = router;