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
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = userRes.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
