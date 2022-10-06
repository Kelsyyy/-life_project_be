const express = require('express');
const router = express.Router();
// const pool = require('../utils/db');
const picnicController = require('../controllers/picnic');
const authMid = require('../middlewares/auth');
const picnicModel = require('../models/picnic');
const path = require('path');
const multer = require('multer'); //第三方套件

// 給會員頁
router.get('/official/member', picnicController.getMemberPicnicData);
router.get('/official/memberJoin', picnicController.picnicOfficalJoin);
router.get('/official/memberCollect', picnicController.picnicOffacialCollect);
router.get('/group/member', picnicController.getMemberPicnicGroupData);
router.get('/group/memberJoin', picnicController.picnicGroupJoin);
router.get('/group/memberCollect', picnicController.picnicGroupCollect);

// --------- 官方活動 ---------
// 首頁列表
router.get('/official', picnicController.getPicnicList);

// get includes join 此會員所有加入
router.get('/official/officialAllJoin', authMid.checkLogin, async (req, res) => {
  let getJoin = await picnicModel.getJoinOfficial(req.session.user.id);
  // console.log(req.session.user.id);
  res.json(getJoin);
});

//add join
router.post('/officialAddJoin/:officialId', authMid.checkLogin, picnicController.postOfficialJoin);

// delete join
router.delete('/officialJoin/:officialId', authMid.checkLogin, picnicController.postOfficiaDeleteJoin);

// get includes collect 此會員所有收藏
router.get('/official/officialAllCollect', authMid.checkLogin, async (req, res) => {
  let getCollect = await picnicModel.getCollectOfficial(req.session.user.id);
  // console.log(req.session.user.id);
  res.json(getCollect);
});

// add collect
router.post('/collectAddJoin/:officialId', authMid.checkLogin, picnicController.postOfficialCollectJoin);

// delete collect
router.delete('/collectDelJoin/:officialId', authMid.checkLogin, picnicController.postOfficiaDeleteCollect);

// 詳細頁
router.get('/official/:officialId', picnicController.getPicnicDetail);

// --------- 開團活動 ---------
// 開團首頁列表
router.get('/group', picnicController.getPrivateList);

// get includes 此會員所有加入活動
router.get('/group/picnicAllJoin', authMid.checkLogin, async (req, res) => {
  let getJoin = await picnicModel.getJoinPicnic(req.session.user.id);
  res.json(getJoin);
});

// add join
router.post('/groupAddJoin/:groupId', authMid.checkLogin, picnicController.postPicnicJoin);

// delete join
router.delete('/groupJoin/:groupId', authMid.checkLogin, picnicController.postDeleteJoin);

// get includes collect 此會員所有收藏
router.get('/group/privateAllCollect', authMid.checkLogin, async (req, res) => {
  let getCollect = await picnicModel.getCollectPrivate(req.session.user.id);
  // console.log(req.session.user.id);
  res.json(getCollect);
});

// add collect
router.post('/collectGroupAddJoin/:groupId', authMid.checkLogin, picnicController.postPrivateCollectJoin);

// delete collect
router.delete('/collectGroupDelJoin/:groupId', authMid.checkLogin, picnicController.postPrivateDeleteCollect);

// del create from data
router.delete('/groupCreate/:groupId', authMid.checkLogin, picnicController.postPrivateDeleteCreate);

// 開團列表詳細頁
router.get('/group/:groupId', picnicController.getPrivateDetail);

// 建立活動表單
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'picnic'));
  },
  filename: function (req, file, cb) {
    // console.log('file', file);
    cb(null, file.originalname);
  },
});
const uploader = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // console.log('--- file ---', file);
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/webp') {
      cb(new Error('上傳的檔案型態不接受'), false);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 1000 * 1024,
  },
});

router.post('/create', uploader.single('image'), picnicController.getFormData);
router.put('/createUpdate/:groupId', uploader.single('image'), picnicController.getUpdateFormData);

module.exports = router;
