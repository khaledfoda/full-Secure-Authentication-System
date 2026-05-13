const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  
  const query = "SELECT id, name, email, role FROM users WHERE id = ?";
  
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: results[0] });
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const secret = speakeasy.generateSecret({
      length: 20
    });

    const query = `
      INSERT INTO users (name, email, password, role, twofa_secret)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [name, email, hashedPassword, role, secret.base32],
      async (err) => {
        if (err) return res.status(500).send(err);

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
          message: "User registered successfully",
          qrCode
        });
      }
    );
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Password correct",
      userId: user.id
    });
  });
};

exports.verify2FA = (req, res) => {
  const { userId, token } = req.body;

  const query = "SELECT * FROM users WHERE id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: "base32",
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: jwtToken,
      role: user.role
    });
  });
};