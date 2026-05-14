const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../config/passport");

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../config/db");

router.post("/register", authController.register);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/register", (req, res, next) => {
  const role = req.query.role || "user";
  req.session.googleRole = role;
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/register", (req, res, next) => {
  const role = req.query.role || "user";
  req.session.githubRole = role;
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login.html?error=oauth" }),
  (req, res) => {
    if (!req.user || !req.user.id) {
      return res.redirect("/login.html?error=oauth");
    }
    
    db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, users) => {
      if (err || users.length === 0) {
        return res.redirect("/login.html?error=oauth");
      }
      
      const user = users[0];
      const qrCode = require("qrcode");
      const speakeasy = require("speakeasy");
      
      if (user.twofa_secret === "TEMP" || !user.twofa_secret) {
        const secret = speakeasy.generateSecret({ 
          length: 20,
          name: user.email
        });
        
        db.query("UPDATE users SET role = ?, twofa_secret = ? WHERE id = ?", 
          [req.session.githubRole || "user", secret.base32, user.id], (err) => {
          req.session.githubRole = null;
          
          qrCode.toDataURL(secret.otpauth_url).then(qr => {
            res.redirect(`/github-setup.html?userId=${user.id}&qr=${encodeURIComponent(qr)}`);
          });
        });
      } else {
        res.redirect(`/verify-2fa.html?userId=${user.id}&google=true`);
      }
    });
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html?error=oauth" }),
  (req, res) => {
    if (!req.user || !req.user.id) {
      return res.redirect("/login.html?error=oauth");
    }
    
    db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, users) => {
      if (err || users.length === 0) {
        return res.redirect("/login.html?error=oauth");
      }
      
      const user = users[0];
      const qrCode = require("qrcode");
      const speakeasy = require("speakeasy");
      
      if (user.twofa_secret === "TEMP" || !user.twofa_secret) {
        const secret = speakeasy.generateSecret({ 
          length: 20,
          name: user.email
        });
        
        db.query("UPDATE users SET role = ?, twofa_secret = ? WHERE id = ?", 
          [req.session.googleRole || "user", secret.base32, user.id], (err) => {
          req.session.googleRole = null;
          
          qrCode.toDataURL(secret.otpauth_url).then(qr => {
            res.redirect(`/google-setup.html?userId=${user.id}&qr=${encodeURIComponent(qr)}`);
          });
        });
      } else {
        res.redirect(`/verify-2fa.html?userId=${user.id}&google=true`);
      }
    });
  }
);
router.post("/login", authController.login);
router.post("/verify-2fa", authController.verify2FA);
router.get("/profile", authMiddleware, authController.getProfile);
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logout successful" });
});

router.get("/admin/users", authMiddleware, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ message: "Forbidden" });
  }
  
  let query;
  if (req.user.role === "manager") {
    query = "SELECT id, name, email, role FROM users WHERE role = 'user'";
  } else {
    query = "SELECT id, name, email, role FROM users";
  }
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: results, canEdit: req.user.role === "admin" });
  });
});

router.put("/admin/users/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { name, email } = req.body;
  const query = "UPDATE users SET name = ?, email = ? WHERE id = ?";
  db.query(query, [name, email, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User updated successfully" });
  });
});

router.put("/admin/users/:id/role", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { role } = req.body;
  if (!["user", "manager", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const query = "UPDATE users SET role = ? WHERE id = ?";
  db.query(query, [role, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Role updated successfully" });
  });
});

router.delete("/admin/users/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully" });
  });
});

module.exports = router;