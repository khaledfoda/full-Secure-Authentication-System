const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const db = require("../config/db");
const speakeasy = require("speakeasy");

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

        const secret = speakeasy.generateSecret({ length: 20 });

        db.query(
          "INSERT INTO users (name, email, role, twofa_secret) VALUES (?, ?, ?, ?)",
          [name, email, "user", secret.base32],
          (err, result) => {
            if (err) return done(err);

            db.query("SELECT * FROM users WHERE id = ?", [result.insertId], (err, newUser) => {
              return done(null, newUser[0]);
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
    done(err, users[0]);
  });
});

module.exports = passport;