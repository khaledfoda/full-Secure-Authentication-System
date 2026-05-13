const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(require("express-session")({ secret: "session-secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "../frontend")));

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const authMiddleware = require("./middleware/authMiddleware.js");
const roleMiddleware = require("./middleware/roleMiddleware");

app.get("/", (req, res) => {
  res.send("Auth System API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.get("/api/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

app.get("/api/manager", authMiddleware, roleMiddleware(["manager"]), (req, res) => {
  res.json({ message: "Welcome Manager" });
});

app.get("/api/user", authMiddleware, roleMiddleware(["user"]), (req, res) => {
  res.json({ message: "Welcome User" });
});

const PORT = process.env.PORT || 3000;

const keyPath = path.join(__dirname, "keys", "server.key");
const certPath = path.join(__dirname, "keys", "server.cert");

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const https = require("https");
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
    console.log("Note: Add SSL certificates to enable HTTPS");
  });
}