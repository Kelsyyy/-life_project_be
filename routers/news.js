const express = require('express');
const router = express.Router();

const newsController = require('../controllers/news');

// ===========================================================================
// GET NEWS: /api/1.0/news?cate=1
router.get('/', newsController.getNewsList);
router.get('/category', newsController.getNewsCategory);
router.post('/', newsController.postNews);

module.exports = router;
