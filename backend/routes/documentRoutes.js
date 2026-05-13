const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const documentController = require("../controllers/documentController");

const uploadDir = path.join(__dirname, "..", "uploads");
const tempDir = path.join(__dirname, "..", "temp");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `temp_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    const allowedExtensions = [".pdf", ".docx", ".ppt", ".pptx"];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, PPT, PPTX files are allowed (max 5MB)"));
    }
  }
});

router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  documentController.uploadDocument(req, res);
}, (err, req, res, next) => {
  res.status(400).json({ message: err.message });
});
router.get("/", authMiddleware, documentController.getDocuments);
router.get("/download/:id", authMiddleware, documentController.downloadDocument);
router.delete("/:id", authMiddleware, documentController.deleteDocument);
router.get("/verify/:id", authMiddleware, documentController.verifyDocument);
router.get("/public-key", documentController.getPublicKey);

module.exports = router;