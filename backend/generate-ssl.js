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

cert.setSubject([
  { name: "commonName", value: "192.168.56.1" },
  { name: "subjectAltName", value: "IP:192.168.56.1" }
]);
cert.setIssuer([{ name: "commonName", value: "192.168.56.1" }]);
cert.setExtensions([
  {
    name: "subjectAltName",
    altNames: [
      { type: 7, ip: "192.168.56.1" }
    ]
  }
]);

cert.publicKey = keypair.publicKey;

cert.sign(keypair.privateKey, forge.md.sha256.create());

const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
const certPem = forge.pki.certificateToPem(cert);

fs.writeFileSync(path.join(keysDir, "server.key"), privateKeyPem);
fs.writeFileSync(path.join(keysDir, "server.cert"), certPem);

console.log("SSL certificates generated with IP: 192.168.56.1");
console.log("Run: node app.js");
console.log("Access from network: https://192.168.56.1:3001/");