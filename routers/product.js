const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const authMiddleware = require('../middlewares/auth');
const path = require('path');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // dirname 目前檔案的位置
    if (file.originalname.includes('detail')) {
      cb(null, path.join(__dirname, '..', 'public', 'product', 'product_detail_img'));
    } else {
      cb(null, path.join(__dirname, '..', 'public', 'product', 'product_img'));
    }
  },
  // 圖片名稱
  filename: function (req, file, cb) {
    // 原始檔名 file.originalname
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
    fileSize: 4000 * 1024,
  },
});

// GET /products/index
router.get('/index', productController.getIndexProduct);

// GET /products
router.get('/', productController.getProductList);

// GET /products/category
router.get('/category', productController.getProductCategory);

// GET /products/brand
router.get('/brand', productController.getBrandList);

// GET /products/like
router.get('/like', authMiddleware.checkLogin, productController.getProductLike);

// GET /products/rank
router.get('/rank', productController.getProductRank);

// GET /products/1/recommend
router.get('/recommend', productController.getRandomProductRecommend);

// GET /products/1/backstage
router.get('/backstage', productController.getProductList);

//GET /products/userlike
router.get('/userlike', authMiddleware.checkLogin, productController.getUserProductLike);

router.get('/discount', productController.getDiscount);

// get product for id
// GET /products/1
router.get('/:id', productController.getProductDetail);

// GET /products/1/detailImg
router.get('/:id/detailImg', productController.getProductDetailImg);

// GET /products/1/comment
router.get('/:id/productComment', productController.getProductComment);

// POST /products/1/comment
router.post('/:id/comment', authMiddleware.checkLogin, productController.writeProductComment);

// POST /products/addLike
router.post('/addLike', authMiddleware.checkLogin, productController.addProductLike);
// DELETE /products/1/removeLike
router.delete('/:id/removeLike', authMiddleware.checkLogin, productController.removeProductLike);

router.post('/addProduct', uploader.array('photo1'), productController.addProduct);

router.post('/addDiscount', productController.addDiscount);

router.put('/updateProduct', uploader.array('photo1'), productController.productUpdate);

router.put('/deleteProduct', productController.productDelete);

router.delete('/deleteDiscount', productController.discountDelete);

module.exports = router;
