const crypto = require("crypto");
const fs = require("fs");

function generateHash(filePath) {
  const fileContent = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileContent).digest("hex");
  return hash;
}

function verifyHash(filePath, storedHash) {
  const calculatedHash = generateHash(filePath);
  return calculatedHash === storedHash;
}

module.exports = { generateHash, verifyHash };