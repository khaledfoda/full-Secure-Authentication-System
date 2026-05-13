const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../config/db");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-2fa", authController.verify2FA);
router.get("/profile", authMiddleware, authController.getProfile);
router.post("/logout", (req, res) => {
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