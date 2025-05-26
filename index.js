const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("User management API is running!");
});

// Проверка подключения к базе данных
pool
  .query("SELECT NOW()")
  .then((res) => console.log("PostgreSQL подключен:", res.rows[0]))
  .catch((err) => {
    console.error("Ошибка подключения к PostgreSQL:", err);
    process.exit(1);
  });

pool
  .query("SELECT * FROM users")
  .then((res) => console.log(res.rows))
  .catch((err) => console.error("Ошибка:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
