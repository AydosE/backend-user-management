const bcrypt = require("bcrypt");
const pool = require("../db");

(async () => {
  try {
    const users = await pool.query("SELECT id, password FROM users");

    for (const user of users.rows) {
      if (user.password.length < 60) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
          hashedPassword,
          user.id,
        ]);
        console.log(`Пароль для ${user.id} обновлён.`);
      }
    }
    console.log("Все пароли обновлены!");
  } catch (error) {
    console.error("Ошибка хеширования:", error);
  }
})();
