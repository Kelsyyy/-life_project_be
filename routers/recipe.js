const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe');
const authMiddleware = require('../middlewares/auth');

// nodejs 內建的物件
const path = require('path');
// Content-Type: multipart/form-data;
// 就要用 multer 相關的套件來處理
const multer = require('multer');
const storage = multer.diskStorage({
  // 儲存資料夾
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'recipe', 'recipe_img'));
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
    // 1k = 1024 => 1000k = 1000 * 1024
    fileSize: 1000 * 1024,
  },
});

const stepStorage = multer.diskStorage({
  // 儲存資料夾
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'recipe', 'recipe_step'));
  },
  // 圖片名稱
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const stepUploader = multer({
  storage: stepStorage,
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
    // 1k = 1024 => 1000k = 1000 * 1024
    fileSize: 1000 * 1024,
  },
});

// GET recipe /api/1.0/recipes?sort=1&user=1&name='咖啡'&page=2&perPage=7
router.get('/', recipeController.getRecipeList);

// GET /api/1.0/recipes/category
router.get('/category', recipeController.getRecipeCate);

// GET /api/1.0/recipes/material
router.get('/material', recipeController.getMaterialList);

// GET /api/1.0/recipes/like
router.get('/like', authMiddleware.checkLogin, recipeController.getUserRecipeLike);

// GET /api/1.0/recipes/name
router.get('/name', recipeController.getRecipeName);

// GET /api/1.0/recipes/materialName
router.get('/materialName', recipeController.getRecipeMaterialName);

// GET detail /api/1.0/recipes/5
router.get('/:id', recipeController.getRecipeDetail);

// GET material /api/1.0/recipes/5/material
router.get('/:id/material', recipeController.getMaterialById);

// GET step /api/1.0/recipes/5/step
router.get('/:id/step', recipeController.getStepById);

// GET comment /api/1.0/recipes/5/comments
router.get('/:id/comment', recipeController.getRecipeComment);

// POST comment /api/1.0/recipes/5/comment
router.post('/:id/comment', authMiddleware.checkLogin, recipeController.postRecipeComment);

// POST comment /api/1.0/recipes/5/like
router.post('/:id/like', authMiddleware.checkLogin, recipeController.postRecipeLike);

// POST recipe /api/1.0/recipes
router.post('/', authMiddleware.checkLogin, uploader.single('image'), recipeController.postRecipe);

// POST material /api/1.0/recipes/5/material
router.post('/:id/material', authMiddleware.checkLogin, recipeController.postRecipeMaterial);

// POST step /api/1.0/recipes/5/step
router.post('/:id/step', authMiddleware.checkLogin, stepUploader.array('img'), recipeController.postRecipeStep);

// DELETE like /api/1.0/recipes/5/like
router.delete('/:id/like', authMiddleware.checkLogin, recipeController.delUserRecipeLike);

// DELETE valid /api/1.0/recipes/5/material
router.delete('/:id/material', authMiddleware.checkLogin, recipeController.delRciepMaterial);

// PUT valid /api/1.0/recipes/5?valid=0
router.put('/:id', uploader.single('image'), authMiddleware.checkLogin, recipeController.updateRecipe);

// PUT valid /api/1.0/recipes/5?valid=0
// router.put('/:id/material', authMiddleware.checkLogin, recipeController.updateRecipe);

// PUT step /api/1.0/recipe/5/step
router.put('/:id/step', authMiddleware.checkLogin, stepUploader.array('img'), recipeController.updateRecipeStep);

// DEL comment /api/1.0/recipes/comment/5
router.delete('/comment/:id', authMiddleware.checkLogin, recipeController.delRecipeComment);

// PUT comment /api/1.0/recipes/comment/5
router.put('/comment/:id', authMiddleware.checkLogin, recipeController.updateRecipeComment);

module.exports = router;
