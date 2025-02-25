const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// Passport configuration
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://foodanalyser.onrender.com/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("access token:", accessToken); // Debugging
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value || `${profile.username}@no-email.com`;
          const avatar = profile.photos?.[0]?.value || "";

          user = await User.create({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email: email,
            avatar: avatar,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://foodanalyser.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile); // Debugging
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value || `${profile.id}@no-email.com`;
          const avatar = profile.photos?.[0]?.value || "";

          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || "Google User",
            email: email,
            avatar: avatar,
          });
        }

        return done(null, user);
      } catch (error) {
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

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// GitHub authentication routes
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.send(`
      <script>
        window.opener.postMessage({ type: 'social_auth_success', token: '${token}' }, 'https://foodanalyserr.vercel.app');
        window.close();
      </script>
    `);
  }
);

// Google authentication routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.send(`
      <script>
        window.opener.postMessage({ type: 'social_auth_success', token: '${token}' }, 'https://foodanalyserr.vercel.app');
        window.close();
      </script>
    `);
  }
);

module.exports = router;