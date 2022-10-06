const newsModel = require('../models/news');
const moment = require('moment');

async function getNewsList(req, res) {
  let cate = req.query.cate;
  // console.log(cate);
  let data = await newsModel.getAllNews(cate);
  res.json(data);
}

async function getNewsCategory(req, res) {
  let data = await newsModel.getAllCategory();
  res.json(data);
}

async function postNews(req, res) {
  let { category, content } = req.body;
  let time = moment().format('YYYY-MM-DD');
  let result = await newsModel.postNews(category, time, content);
  res.json(result);
}

module.exports = { getNewsList, getNewsCategory, postNews };
