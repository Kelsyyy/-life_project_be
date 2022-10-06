const express = require('express');
const router = express.Router();
const campingController = require('../controllers/camping');
const authMid = require('../middlewares/auth');
const campingModel = require('../models/camping');
const path = require('path');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // dirname 目前檔案的位置
    cb(null, path.join(__dirname, '..', 'public', 'camping', 'activity_camping_img'));
  },
  // 圖片名稱
  filename: function (req, file, cb) {
    // 原始檔名 file.originalname
    cb(null, file.originalname);
    // console.log('file', file);
  },
});

const uploader = multer({
  storage: storage,
  // 過濾圖片的種類
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/webp') {
      cb(new Error('上傳的檔案型態不接受'), false);
    } else {
      cb(null, true);
    }
  },
  // 過濾檔案的大小
  limits: {
    // 1k = 1024 => 200k = 200 * 1024
    fileSize: 4000 * 1024,
  },
});
router.get('/', campingController.getCampingList);

router.get('/campingCollected', authMid.checkLogin, async (req, res) => {
  let getCamping = await campingModel.getCollectCamping(req.session.user.id);
  res.json(getCamping);
});

// get includes
router.get('/campingHadJoin', authMid.checkLogin, async (req, res) => {
  let getJoin = await campingModel.getJoinCamping(req.session.user.id);
  res.json(getJoin);
});

// add collect
router.post('/campingCollect/:campingId', authMid.checkLogin, campingController.postCampingCollect);

// delete collect
router.delete('/campingCollect/:campingId', authMid.checkLogin, campingController.postDeleteCollect);

// user collect
router.get('/userCollect', authMid.checkLogin, campingController.userCollects);
// user join history
router.get('/userJoin', authMid.checkLogin, campingController.joinHistory);

// add join  --> /api/1.0/camping/campingJoin/1
router.post('/campingJoin/:campingId', authMid.checkLogin, campingController.postCampingJoin);

// Backstage
router.get('/backstage', campingController.backstageAllData);

// calendar
router.get('/calendar', authMid.checkLogin, campingController.getCalendar);
router.post('/addCalendar', authMid.checkLogin, campingController.postAddCalendar);
router.post('/postCalendar', authMid.checkLogin, campingController.postActivityCalendar);
router.delete('/delCalendar', authMid.checkLogin, campingController.delActivityCalendar);

// post camping
router.post('/campingAdd', uploader.array('photo1'), campingController.postCampingAdd);
router.put('/campingUpdate', uploader.array('photo1'), campingController.putCampingUpdate);
router.put('/campingDel/:campingId', campingController.putCampingDel);

router.delete('/campingJoin/:campingId', authMid.checkLogin, campingController.postDeleteJoin);
router.get('/getUserJoin/:campingId', authMid.checkLogin, campingController.joinuser);
router.get('/:campingId', campingController.getCampingDetail);

module.exports = router;
