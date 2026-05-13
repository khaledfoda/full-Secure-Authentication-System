const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const { encryptFile, decryptFile } = require("../utils/encryption");
const { generateHash, verifyHash } = require("../utils/hash");
const { signHash, verifySignature, getPublicKey } = require("../utils/signature");

const uploadDir = path.join(__dirname, "..", "uploads");
const tempDir = path.join(__dirname, "..", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

exports.uploadDocument = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = req.user.id;
  const originalName = req.file.originalname;
  const tempPath = req.file.path;
  const encryptedName = `${Date.now()}_${Math.random().toString(36).substring(7)}.enc`;
  const encryptedPath = path.join(uploadDir, encryptedName);

  try {
    encryptFile(tempPath, encryptedPath);

    const hashValue = generateHash(encryptedPath);
    const signatureValue = signHash(hashValue);

    const query = `
      INSERT INTO documents (user_id, original_name, encrypted_name, hash_value, signature_value)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [userId, originalName, encryptedName, hashValue, signatureValue], (err, result) => {
      fs.unlinkSync(tempPath);

      if (err) {
        fs.unlinkSync(encryptedPath);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Document uploaded and encrypted successfully",
        documentId: result.insertId,
        originalName,
        hash: hashValue
      });
    });
  } catch (error) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    if (fs.existsSync(encryptedPath)) fs.unlinkSync(encryptedPath);
    res.status(500).json({ error: error.message });
  }
};

exports.getDocuments = (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  let query;
  if (role === "admin" || role === "manager") {
    query = `
      SELECT d.*, u.name as user_name, u.email as user_email
      FROM documents d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.uploaded_at DESC
    `;
  } else {
    query = `SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC`;
  }

  db.query(query, role === "user" ? [userId] : [], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ documents: results });
  });
};

exports.downloadDocument = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  const query = role === "user"
    ? "SELECT * FROM documents WHERE id = ? AND user_id = ?"
    : "SELECT * FROM documents WHERE id = ?";

  db.query(query, role === "user" ? [id, userId] : [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const doc = results[0];
    const encryptedPath = path.join(uploadDir, doc.encrypted_name);

    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ message: "Encrypted file not found" });
    }

    const decryptedPath = path.join(tempDir, `decrypted_${Date.now()}_${doc.original_name}`);

    try {
      decryptFile(encryptedPath, decryptedPath);

      res.download(decryptedPath, doc.original_name, (err) => {
        fs.unlinkSync(decryptedPath);
        if (err) console.error("Download error:", err);
      });
    } catch (error) {
      res.status(500).json({ error: "Decryption failed" });
    }
  });
};

exports.deleteDocument = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  const query = role === "user"
    ? "SELECT * FROM documents WHERE id = ? AND user_id = ?"
    : "SELECT * FROM documents WHERE id = ?";

  db.query(query, role === "user" ? [id, userId] : [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const doc = results[0];
    const encryptedPath = path.join(uploadDir, doc.encrypted_name);

    if (fs.existsSync(encryptedPath)) {
      fs.unlinkSync(encryptedPath);
    }

    db.query("DELETE FROM documents WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Document deleted successfully" });
    });
  });
};

exports.verifyDocument = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT d.*, u.name as user_name, d.user_id
    FROM documents d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const doc = results[0];
    const encryptedPath = path.join(uploadDir, doc.encrypted_name);

    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const currentHash = generateHash(encryptedPath);
    const hashMatch = currentHash === doc.hash_value;

    const publicKey = getPublicKey();
    const signatureValid = verifySignature(doc.hash_value, doc.signature_value, publicKey);

    res.json({
      document: doc,
      integrity: {
        hashMatch,
        currentHash,
        storedHash: doc.hash_value
      },
      signature: {
        valid: signatureValid
      }
    });
  });
};

exports.getPublicKey = (req, res) => {
  const publicKey = getPublicKey();
  res.json({ publicKey });
};