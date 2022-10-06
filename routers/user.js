const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authMid = require('../middlewares/auth');
const path = require('path');
const multer = require('multer');

const { body } = require('express-validator');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'userAvatar'));
  },
  // 圖片名稱
  filename: function (req, file, cb) {
    cb(null, file.originalname);
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
    fileSize: 200 * 1024,
  },
});
const reqistetRules = [
  body('password').isLength({ min: 8 }).withMessage('請輸入8個字以上的半形英文數字'),
  body('newPassword').isLength({ min: 8 }).withMessage('請輸入8個字以上的半形英文數字'),
  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.newPassword;
    })
    .withMessage('「密碼」不一致'),
];

//GET userDate
router.get('/', authMid.checkLogin, userController.getUser);

//GET userDate
router.get('/all', userController.getAllUser);

//GET forgot member
router.get('/forgotmember', userController.getForgotMember);

//PUT usetDate
router.put('/', authMid.checkLogin, uploader.single('photo'), userController.putUser);

//密碼修改
router.put('/password', authMid.checkLogin, reqistetRules, userController.putPassword);

//忘記密碼-確認會員信箱
router.post('/forgotpassword', userController.forgotemail);

//忘記密碼-重置密碼
router.put('/forgotpassword', reqistetRules, userController.forgotpasswordasync);

//取得會員點數
router.get('/points', authMid.checkLogin, userController.getPoints);
router.post('/points', authMid.checkLogin, userController.postPoints);

module.exports = router;
