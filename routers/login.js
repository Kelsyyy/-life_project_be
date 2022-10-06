const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const argon2 = require('argon2');

router.post('/login', async (req, res) => {
  let [users] = await pool.execute('SELECT * FROM users WHERE email= ?', [req.body.email]);
  //確認資料庫有無此信箱
  if (users.length == 0) {
    return res.status(401).json({ message: '信箱或密碼錯誤' });
  }

  let user = users[0];
  let verifyResult = await argon2.verify(user.password, req.body.password);
  if (!verifyResult) {
    return res.status(401).json({ message: '信箱或密碼錯誤' });
  }

  //把資料拿給前端
  let saveUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
  };
  req.session.user = saveUser;
  res.json(user);
});

// logout
router.get('/logout', async (req, res) => {
  req.session.user = null;
  res.json({ message: ' 登出成功' });
});
module.exports = router;
