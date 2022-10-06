const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const argon2 = require('argon2');
const date = require('date-and-time');
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user');

const reqistetRules = [
  body('email').isEmail().withMessage('請輸入正確的Email格式'),
  body('password').isLength({ min: 8 }).withMessage('請輸入8個字以上的半形英文數字'),
  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('「密碼」不一致'),
];

router.post('/', reqistetRules, async (req, res) => {
  const validateResult = validationResult(req);

  //如果驗證結果不是空就繼續往下檢查
  // console.log('驗證結果', validateResult);
  if (!validateResult.isEmpty()) {
    return res.status(400).json({ errors: validateResult.array() });
  }
  //檢查Email有沒有重複
  let [user] = await pool.execute('SELECT * FROM users WHERE email= ?', [req.body.email]);
  //如果從資料庫撈出來的Email大於0 代表有註冊過
  if (user.length > 0) {
    return res.status(400).json({ message: '這個email已經註冊過' });
  }
  let hashPassword = await argon2.hash(req.body.password, 10);
  //取得註冊日期
  const now = new Date();
  let creatTime = date.format(now, 'YYYY/MM/DD');

  let photo = '/userAvatar/alex.png';
  //寫進資料庫
  await pool.execute('INSERT INTO users (name,email,password,create_time,photo) VALUES(?,?,?,?,?)', [req.body.name, req.body.email, hashPassword, creatTime, photo]);
  let [member] = await pool.execute('SELECT * FROM users WHERE email= ?', [req.body.email]);
  console.log('member', member);
  let user_id = member[0].id;
  let point = 100;
  let event = '新會員註冊';
  await userModel.postpoints(user_id, point, event, creatTime);
  //同步user點數
  await userModel.updatapoints(user_id);
  //回應前端
  res.json({ message: '註冊成功' });
});
module.exports = router;
