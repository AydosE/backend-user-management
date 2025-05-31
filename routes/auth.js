const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(400).json({ message: "Пользователь не найден" });

    if (user.rows[0].status === "blocked")
      return res.status(403).json({ message: "Аккаунт заблокирован" });

    const isValidPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isValidPassword)
      return res.status(401).json({ message: "Неверный пароль" });

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    await pool.query(
      "UPDATE users SET last_login = NOW(), timezone = $1 WHERE id = $2",
      [timezone, user.rows[0].id]
    );

    const token = jwt.sign(
      { id: user.rows[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, status, last_login, timezone) VALUES ($1, $2, $3, 'active', NOW(), $4) RETURNING id",
      [name, email, hashedPassword, timezone]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, message: "Регистрация успешна" });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
