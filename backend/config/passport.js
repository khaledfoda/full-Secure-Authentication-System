const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const passport = require("passport");
const db = require("../config/db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const name = profile.displayName;

      db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
        if (err) return done(err);

        if (users.length > 0) {
          return done(null, users[0]);
        }

        db.query(
          "INSERT INTO users (name, email, password, role, twofa_secret) VALUES (?, ?, ?, ?, ?)",
          [name, email, "", "user", "TEMP"],
          (err, result) => {
            if (err) return done(err);

            db.query("SELECT * FROM users WHERE id = ?", [result.insertId], (err, newUser) => {
              return done(null, { ...newUser[0], isNewGoogleUser: true });
            });
          }
        );
      });
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, users) => {
    if (err) return done(err);
    if (users.length === 0) {
      return done(null, false);
    }
    done(err, users[0]);
  });
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"]
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
      const name = profile.displayName || profile.username;

      db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
        if (err) return done(err);

        if (users.length > 0) {
          return done(null, users[0]);
        }

        db.query(
          "INSERT INTO users (name, email, password, role, twofa_secret) VALUES (?, ?, ?, ?, ?)",
          [name, email, "", "user", "TEMP"],
          (err, result) => {
            if (err) return done(err);

            db.query("SELECT * FROM users WHERE id = ?", [result.insertId], (err, newUser) => {
              return done(null, { ...newUser[0], isNewOAuthUser: true });
            });
          }
        );
      });
    }
  )
);

module.exports = passport;