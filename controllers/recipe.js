const recipeModel = require('../models/recipe');
const moment = require('moment');
const pool = require('../utils/db');

async function getRecipeList(req, res) {
  let { sort, user, name = '', page, perPage, materialName = '', recipeCate, productCate, random, userLike } = req.query;

  // get recipe_id by material name [ 5, 9, 13 ]
  let searchMaterial = [];
  if (materialName) {
    searchMaterial = await recipeModel.getMaterialByName(materialName);
    if (searchMaterial.length === 0) return res.json({ pagination: { total: 0, perPage: 0, page: 0, lastPage: 0 }, data: [] });
  }

  // get recipe_id by user like
  let searchLike = [];
  if (req.session.user && userLike === 'true') {
    searchLike = await recipeModel.getRecipeLikeByUser(req.session.user.id);
    if (searchLike.length === 0) return res.json({ pagination: { total: 0, perPage: 0, page: 0, lastPage: 0 }, data: [] });
  }
  // concat search material and user like list
  let recipeId = searchMaterial.concat(searchLike);

  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await recipeModel.getRecipeCount(user, name, recipeId, recipeCate, productCate);
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);

  // random recipe
  if (random) perPage = parseInt(random);
  let randomRecipe = [];
  for (let i = 0; i < random; i++) {
    while (randomRecipe.length < i + 1) {
      let id = Math.floor(Math.random() * total) + 1;
      if (!randomRecipe.includes(id)) randomRecipe.push(id);
    }
  }
  randomRecipe = randomRecipe.join(',');

  let data = await recipeModel.getRecipeList(sort, user, name, perPage, offset, recipeId, recipeCate, productCate, randomRecipe);

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    data,
  });
}

async function getRecipeName(req, res) {
  let result = await recipeModel.getRecipeName();
  let data = result[0].map((d) => d.name);
  res.json(data);
}

async function getRecipeMaterialName(req, res) {
  let result = await recipeModel.getRecipeMaterialName();
  console.log(result[0]);
  let data = [];
  result[0].forEach((d) => {
    if (!data.includes(d.name)) data.push(d.name);
  });
  console.log(data);
  res.json(data);
}

async function getRecipeDetail(req, res) {
  let id = req.params.id;
  let data = await recipeModel.getRecipeById(id);
  res.json(data);
}

async function getMaterialById(req, res) {
  let id = req.params.id;
  let data = await recipeModel.getMaterialById(id);
  res.json(data);
}

async function getStepById(req, res) {
  let id = req.params.id;
  let data = await recipeModel.getStepById(id);
  res.json(data);
}

async function getRecipeCate(req, res) {
  let data = await recipeModel.getRecipeCateList();
  res.json(data);
}

async function getRecipeComment(req, res) {
  let id = req.params.id;
  let data = await recipeModel.getRecipeCommentById(id);
  res.json(data);
}

async function getMaterialList(req, res) {
  let data = await recipeModel.getMaterialList();
  let materialArr = data.map((d) => {
    return d.name;
  });
  res.json(materialArr);
}

async function postRecipeComment(req, res) {
  let id = req.params.id;
  let user_id = req.session.user.id;
  let { comment } = req.body;
  let time = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log(time);
  recipeModel.postCommentById(user_id, comment, id, time);
  res.json({ message: 'ok' });
}

async function postRecipeLike(req, res) {
  let id = parseInt(req.params.id);
  let user_id = req.session.user.id;
  let likeList = await recipeModel.getRecipeLikeByUser(user_id);
  if (likeList.includes(id)) return res.json({ message: '此食譜已收藏' });
  await recipeModel.postLikeById(user_id, id);
  res.json({ message: 'ok' });
}

// POST RECIPE !!!!
async function postRecipe(req, res) {
  // console.log('postRecipe', req.body);
  let { name, content, category, product_category } = req.body;
  let user_id = req.session.user.id;
  let time = moment().format('YYYY-MM-DD h:mm:ss');
  let data = [name, content, category, product_category, `/recipe/recipe_img/${req.file.filename}`, user_id, time];
  let insertId = await recipeModel.postRecipe(data);
  console.log(insertId);
  res.json({ message: 'ok', id: insertId });
}

async function postRecipeStep(req, res) {
  let id = parseInt(req.params.id);
  let step = req.body.step.split(',');
  let content = req.body.content.split(',');
  let files = req.files;
  let data = [];
  for (let i = 0; i < step.length; i++) {
    if (!step[i] || !content[i] || !files[i]) break;
    data.push([]);
    data[i].push(id, parseInt(step[i]), `/recipe/recipe_step/${files[i].originalname}`, content[i]);
  }
  console.log(data);
  if (data.length === 0) return res.json({ message: '資料為空' });
  await recipeModel.postRecipeStepById(data);
  res.json({ message: 'ok' });
}

async function postRecipeMaterial(req, res) {
  let id = parseInt(req.params.id);
  let insertData = req.body.material.map((d) => {
    if (!d.name || !d.quantity) return;
    let dataObj = { ...d, id: id };
    return Object.values(dataObj);
  });
  // delete empty item
  insertData = insertData.filter((d) => !!d);
  if (insertData.length === 0) return res.json({ message: '資料為空' });
  await recipeModel.postRecipeMaterialById(insertData);
  res.json({ message: 'ok' });
}

async function getUserRecipeLike(req, res) {
  let user_id = req.session.user.id;
  let data = await recipeModel.getRecipeLikeByUser(user_id);
  res.json({ message: 'ok', data });
}

async function delUserRecipeLike(req, res) {
  let user_id = req.session.user.id;
  let recipe_id = req.params.id;
  await recipeModel.delRecipeLike(user_id, recipe_id);
  res.json({ message: 'ok' });
}

async function updateRecipe(req, res) {
  let recipe_id = req.params.id;
  console.log('body', req.body);
  // only update valid to 1 or 0
  let { valid } = req.query;
  if (valid) {
    let result = await recipeModel.updateRecipeValidById(recipe_id, valid);
    return res.json({ message: 'ok' });
  }
  // update recipe data
  let { name, content, category, product_category } = req.body;
  let data = { name, content, category, product_category };
  if (req.file) data = { ...data, image: `/recipe/recipe_img/${req.file.originalname}` };

  let result = await recipeModel.updateRecipe(recipe_id, data);
  res.json({ message: 'ok' });
  // let result = await recipeModel.updateRecipe(recipe_id, data);
}

async function delRciepMaterial(req, res) {
  let recipe_id = req.params.id;
  let result = await recipeModel.delRecipeMaterialById(recipe_id);
  res.json({ message: 'ok' });
}

async function updateRecipeStep(req, res) {
  let recipe_id = req.params.id;
  let { mode } = req.query;
  console.log('mode', mode);
  // put content
  let { putContent } = req.body;
  if (mode === 'content') {
    putContent.map(async (d) => {
      if (d[0] === '' || d[1] === '') return;
      await recipeModel.updateRecipeStep(recipe_id, d[1], '', d[0]);
    });
  }
  // put image
  if (mode === 'image') {
    let files = req.files;
    let { step } = req.body;
    for (let i = 0; i < step.length; i++) {
      await recipeModel.updateRecipeStep(recipe_id, '', `/recipe/recipe_step/${files[i].originalname}`, step[i]);
    }
  }
  res.json({ message: 'ok' });
}

async function delRecipeComment(req, res) {
  let comment_id = req.params.id;
  let result = await recipeModel.delRecipeCommentById(comment_id);
  res.json({ msg: 'ok' });
}

async function updateRecipeComment(req, res) {
  let comment_id = req.params.id;
  let comment = req.body.comment;
  let result = await recipeModel.updateRecipeCommentById(comment_id, comment);
  res.json({ msg: 'ok' });
}

module.exports = {
  getRecipeList,
  getRecipeDetail,
  getMaterialById,
  getStepById,
  getRecipeCate,
  getRecipeComment,
  getMaterialList,
  postRecipeComment,
  postRecipeLike,
  postRecipeStep,
  postRecipeMaterial,
  postRecipe,
  getUserRecipeLike,
  delUserRecipeLike,
  updateRecipe,
  delRciepMaterial,
  updateRecipeStep,
  delRecipeComment,
  updateRecipeComment,
  getRecipeName,
  getRecipeMaterialName,
};
