const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const keysDir = path.join(__dirname, "..", "keys");

if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

const privateKeyPath = path.join(keysDir, "privateKey.pem");
const publicKeyPath = path.join(keysDir, "publicKey.pem");

function getOrCreateKeys() {
  if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
    return {
      privateKey: fs.readFileSync(privateKeyPath),
      publicKey: fs.readFileSync(publicKeyPath)
    };
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs8", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

  return { publicKey, privateKey };
}

function signHash(hash) {
  const { privateKey } = getOrCreateKeys();
  const sign = crypto.createSign("SHA256");
  sign.update(hash);
  sign.end();
  return sign.sign(privateKey, "base64");
}

function verifySignature(hash, signature, publicKey) {
  const verify = crypto.createVerify("SHA256");
  verify.update(hash);
  verify.end();
  return verify.verify(publicKey, signature, "base64");
}

function getPublicKey() {
  const { publicKey } = getOrCreateKeys();
  return publicKey;
}

module.exports = { signHash, verifySignature, getPublicKey };