const userModel = require('../models/user');
const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const pool = require('../utils/db');
const date = require('date-and-time');

//get 會員資料
async function getUser(req, res) {
  let user_id = req.session.user.id;
  let user = await userModel.getuser(user_id);
  res.json(user);
}
//put 修改會員資料
async function putUser(req, res) {
  let user_id = req.session.user.id;
  let filename = req.file ? '/userAvatar/' + req.file.filename : '';
  let { name, birth, phone, gender, cityName, areaName, intro } = req.body;
  await userModel.putuser(name, birth, phone, gender, cityName, areaName, intro, filename, user_id);
  let user = await userModel.getuser(user_id);
  res.json(user);
}
//put 修改會員密碼
async function putPassword(req, res) {
  let user_id = req.session.user.id;
  const validateResult = validationResult(req);
  if (!validateResult.isEmpty()) {
    return res.status(400).json({ errors: validateResult.array() });
  }
  let user = await userModel.getuser(user_id);
  // //驗證舊密碼有無相符合
  let verifyResult = await argon2.verify(user.password, req.body.password);
  if (!verifyResult) {
    return res.status(401).json({ message: '舊密碼錯誤' });
  }
  let hashPassword = await argon2.hash(req.body.newPassword, 10);

  await userModel.putpassword(hashPassword, user_id);
  res.json('密碼修改成功');
}

//忘記密碼-檢查信箱{
async function forgotemail(req, res) {
  let email = req.body.email;
  let users = await userModel.inspectionEmail(email);
  //確認資料庫有無此信箱
  if (users.length == 0) {
    return res.status(401).json({ message: '信箱錯誤' });
  }
  let user = users[0];
  //把資料拿給前端
  let saveUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
  req.session.member = saveUser;
  res.json(saveUser);
}

//getForgotMember
async function getForgotMember(req, res) {
  res.json(req.session.member);
}

//忘記密碼-重置密碼
async function forgotpasswordasync(req, res) {
  let hashPassword = await argon2.hash(req.body.newPassword, 10);
  let user_id = req.session.member.id; //member not user
  await userModel.putpassword(hashPassword, user_id);
  req.session.member = null;
  res.json('密碼修改成功');
}

//取得會員點數資料
async function getPoints(req, res) {
  let user_id = req.session.user.id;
  const perPage = 5;
  const page = req.query.page || 1;
  let [total] = await pool.execute('SELECT COUNT(*) AS total FROM user_points WHERE user_id = ?', [req.session.user.id]);
  total = total[0].total;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  let data = await userModel.getpoints(user_id);
  let alldata = await userModel.getpoints(user_id);
  // console.log('points', data);
  data = data.slice(offset, offset + perPage);
  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    data,
    alldata,
  });
}
//新增點數事件
async function postPoints(req, res) {
  let user_id = req.session.user.id;
  let { point, event } = req.body;
  const now = new Date();
  let creatTime = date.format(now, 'YYYY/MM/DD');
  await userModel.postpoints(user_id, point, event, creatTime);
  //同步user點數
  await userModel.updatapoints(user_id);
  res.json({ msg: '點數使用成功' });
}

async function getAllUser(req, res) {
  let data = await userModel.getAllUser();
  res.json(data);
}

module.exports = {
  getUser,
  putUser,
  putPassword,
  forgotemail,
  forgotpasswordasync,
  getPoints,
  postPoints,
  getAllUser,
  getForgotMember,
};
