const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware.js");
const roleMiddleware = require("./middleware/roleMiddleware");

app.get("/", (req, res) => {
  res.send("Auth System API is running");
});

app.use("/api/auth", authRoutes);

app.get("/api/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

app.get("/api/manager", authMiddleware, roleMiddleware(["manager"]), (req, res) => {
  res.json({ message: "Welcome Manager" });
});

app.get("/api/user", authMiddleware, roleMiddleware(["user"]), (req, res) => {
  res.json({ message: "Welcome User" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});