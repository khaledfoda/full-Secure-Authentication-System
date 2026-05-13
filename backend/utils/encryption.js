const crypto = require("crypto");
const fs = require("fs");

const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY || "default-secret-key", "salt", 32);
const IV_LENGTH = 16;

function encryptFile(inputPath, outputPath) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

  const input = fs.readFileSync(inputPath);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);

  const result = Buffer.concat([iv, encrypted]);
  fs.writeFileSync(outputPath, result);

  return outputPath;
}

function decryptFile(inputPath, outputPath) {
  const fileContent = fs.readFileSync(inputPath);
  const iv = fileContent.subarray(0, IV_LENGTH);
  const encrypted = fileContent.subarray(IV_LENGTH);

  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  fs.writeFileSync(outputPath, decrypted);
  return outputPath;
}

module.exports = { encryptFile, decryptFile };