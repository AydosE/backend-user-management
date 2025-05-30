const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Получение списка пользователей
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, last_login, status, timezone FROM users ORDER BY last_login DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновление статуса пользователя (блокировка/разблокировка)
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "blocked"].includes(status)) {
    return res.status(400).json({ message: "Некорректный статус" });
  }

  try {
    await pool.query("UPDATE users SET status = $1 WHERE id = $2", [
      status,
      id,
    ]);
    res.json({ message: "Статус обновлён" });
  } catch (error) {
    console.error("Ошибка обновления статуса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление пользователя
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Пользователь удалён" });
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
