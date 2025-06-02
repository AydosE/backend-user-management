const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const authRoutes = require("./routes/auth");
const signinRoutes = require("./routes/signin");
const userRoutes = require("./routes/users");
const app = express();
const allowedOrigins = [
  "https://frontend-user-management-five.vercel.app",
  "http://localhost:5173",
];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use((req, res, next) => {
  console.log(`Запрос: ${req.method} ${req.url}`);
  next();
});
app.get("/", (req, res) => {
  res.send("User management API is running!");
});

app.get("/auth/status", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Received token:", token);
  console.log(req);

  if (!token) {
    return res.status(401).json({ message: "Unautorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Wrong token" });
  }
});

app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    console.error("Ошибка подключения:", error);
    res.status(500).json({ success: false, message: "Ошибка базы данных" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
