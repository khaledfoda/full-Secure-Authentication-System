const fs = require("fs");
const path = require("path");
const forge = require("node-forge");

const keysDir = path.join(__dirname, "keys");
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

const keypair = forge.pki.rsa.generateKeyPair(2048);

const cert = forge.pki.createCertificate();
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

cert.setSubject([{ name: "commonName", value: "localhost" }]);
cert.setIssuer([{ name: "commonName", value: "localhost" }]);

cert.publicKey = keypair.publicKey;

cert.sign(keypair.privateKey, forge.md.sha256.create());

const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
const certPem = forge.pki.certificateToPem(cert);

fs.writeFileSync(path.join(keysDir, "server.key"), privateKeyPem);
fs.writeFileSync(path.join(keysDir, "server.cert"), certPem);

console.log("SSL certificates generated successfully!");
console.log("Run: node app.js");
console.log("Open: https://localhost:3001/");