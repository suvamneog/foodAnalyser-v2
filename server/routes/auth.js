const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const SERVER_URL =
  process.env.SERVER_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://foodanalyser.onrender.com"
    : `http://localhost:${process.env.PORT || 3001}`);

const FRONTEND_ORIGINS = [
  process.env.CLIENT_URL,
  "https://foodanalyserr.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const verifyPassword = async (plain, stored) => {
  if (!stored) return false;
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    return bcrypt.compare(plain, stored);
  }
  return stored === plain;
};

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    res.status(500).json({ message: "Server error during signup" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account uses social login. Please continue with Google or GitHub.",
      });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.password.startsWith("$2")) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "https://foodanalyser.onrender.com/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          $or: [
            { githubId: profile.id },
            { email: profile.emails?.[0]?.value?.toLowerCase() },
          ],
        });

        if (!user) {
          const email =
            profile.emails?.[0]?.value?.toLowerCase() ||
            `${profile.username}@users.noreply.github.com`;

          user = await User.create({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email,
            avatar: profile.photos?.[0]?.value || "",
          });
        } else if (!user.githubId) {
          user.githubId = profile.id;
          await user.save();
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
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "https://foodanalyser.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails?.[0]?.value?.toLowerCase() },
          ],
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value?.toLowerCase(),
            avatar: profile.photos?.[0]?.value,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
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

const handleAuthCallback = (req, res, provider) => {
  try {
    if (!req.user) {
      throw new Error(`No user data from ${provider}`);
    }

    const token = generateToken(req.user);
    const userData = {
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
    };

    res.send(`<!DOCTYPE html>
<html>
<head><title>Authentication Successful</title>
<style>
  body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#0c0e14;color:#fff}
  .box{padding:2rem;border-radius:1rem;background:#141821;text-align:center}
</style>
</head>
<body>
  <div class="box">
    <h2>Signed in</h2>
    <p>Welcome, ${String(req.user.name || "").replace(/</g, "")}. You can close this window.</p>
  </div>
  <script>
    (function () {
      var payload = {
        type: "social_auth_success",
        token: ${JSON.stringify(token)},
        user: ${JSON.stringify(userData)},
        provider: ${JSON.stringify(provider)}
      };
      var origins = ${JSON.stringify(FRONTEND_ORIGINS)};
      if (window.opener) {
        origins.forEach(function (origin) {
          try { window.opener.postMessage(payload, origin); } catch (e) {}
        });
        try { window.opener.postMessage(payload, "*"); } catch (e) {}
      }
      setTimeout(function () { window.close(); }, 800);
    })();
  </script>
</body>
</html>`);
  } catch (error) {
    console.error(`${provider} callback error:`, error);
    res.send(`<!DOCTYPE html><html><body><script>
      if (window.opener) {
        window.opener.postMessage({ type: "social_auth_failure", error: ${JSON.stringify(
          error.message
        )} }, "*");
      }
      window.close();
    </script></body></html>`);
  }
};

router.get("/github", passport.authenticate("github"));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/auth/failure",
  }),
  (req, res) => handleAuthCallback(req, res, "github")
);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/failure",
  }),
  (req, res) => handleAuthCallback(req, res, "google")
);

router.get("/failure", (req, res) => {
  res.send(`<!DOCTYPE html><html><body style="font-family:system-ui;text-align:center;padding:3rem">
    <h2>Authentication failed</h2>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: "social_auth_failure", error: "Authentication failed. Please try again." }, "*");
      }
      setTimeout(function(){ window.close(); }, 1500);
    </script>
  </body></html>`);
});

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Auth Service",
  });
});

module.exports = router;
