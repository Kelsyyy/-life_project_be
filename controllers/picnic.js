const pool = require('../utils/db');
const moment = require('moment');
const picnicModel = require('../models/picnic');

// ------ for 會員 API -------
async function getMemberPicnicData(req, res) {
  const perPage = 5;
  const page = req.query.page || 1;

  let [totalData] = await pool.execute(
    'SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE valid = 1'
  );
  // console.log(totalData);

  let total = totalData.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);

  let [result] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location, IfNULL(c.people,0) AS currentJoin FROM activity_pincnic_official JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id LEFT JOIN (SELECT picnic_id, COUNT(1) AS people FROM activity_picnic_official_join GROUP BY picnic_id) c ON activity_pincnic_official.id = c.picnic_id WHERE valid = 1 LIMIT ? OFFSET ?`,
    [perPage, offset]
  );

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    result,
  });
}
async function picnicOfficalJoin(req, res) {
  const userId = req.session.user.id;
  //TODO:官方活動修改
  let [result] = await pool.execute(
    'SELECT activity_pincnic_official.id AS picnic_id , activity_pincnic_official.user_id, activity_pincnic_official.location, activity_pincnic_official.address, activity_pincnic_official.activity_date, activity_picnic_state.activity_state, activity_pincnic_official.price, activity_pincnic_official.join_limit, activity_pincnic_official.picnic_title, activity_pincnic_official.place_name, activity_pincnic_official.intr, activity_pincnic_official.img1, activity_pincnic_official.start_date,activity_pincnic_official.end_date, activity_pincnic_official.valid, activity_picnic_official_join.user_id FROM activity_pincnic_official JOIN activity_picnic_official_join ON activity_pincnic_official.id = activity_picnic_official_join.picnic_id JOIN activity_picnic_state ON activity_pincnic_official.activity_state=activity_picnic_state.id WHERE activity_picnic_official_join.user_id = ?',
    [userId]
  );

  const perPage = 5;
  const page = req.query.page || 1;
  let total = result.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  result = result.slice(offset, offset + perPage);

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    result,
  });
}
async function picnicOffacialCollect(req, res) {
  const userId = req.session.user.id;

  let [result] = await pool.execute(
    'SELECT activity_pincnic_official.id AS picnic_id , activity_pincnic_official.user_id AS creater_id, activity_pincnic_official.location, activity_pincnic_official.address, activity_pincnic_official.activity_date, activity_picnic_state.activity_state, activity_pincnic_official.price, activity_pincnic_official.join_limit, activity_pincnic_official.picnic_title, activity_pincnic_official.place_name, activity_pincnic_official.intr, activity_pincnic_official.img1, activity_pincnic_official.start_date,activity_pincnic_official.end_date, activity_pincnic_official.valid, picnic_official_collect.user_id FROM activity_pincnic_official JOIN picnic_official_collect ON activity_pincnic_official.id = picnic_official_collect.picnic_id JOIN activity_picnic_state ON activity_pincnic_official.activity_state=activity_picnic_state.id WHERE picnic_official_collect.user_id = ?',
    [userId]
  );
  // console.log('測試', userId);
  // res.json({ msg: '有收到' });
  const perPage = 5;
  const page = req.query.page || 1;
  let total = result.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  result = result.slice(offset, offset + perPage);

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    result,
  });
}
async function getMemberPicnicGroupData(req, res) {
  const userId = req.session.user.id;
  const perPage = 5;
  const page = req.query.page || 1;

  let [totalData] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE create_user_id=? ANd valid = 1`,
    [userId]
  );
  // console.log(totalData);

  let total = totalData.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);

  let [result] = await pool.execute(
    `SELECT activity_picnic_private.*,activity_picnic_private.id AS picnic_id, activity_picnic_state.activity_state , activity_picnic_location.location, IfNULL(c.people,0) AS currentJoin FROM activity_picnic_private JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id LEFT JOIN (SELECT picnic_id, COUNT(1) AS people FROM activity_picnic_private_join GROUP BY picnic_id) c ON activity_picnic_private.id = c.picnic_id WHERE create_user_id=? AND valid = 1 LIMIT ? OFFSET ?`,
    [userId, perPage, offset]
  );

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    result,
  });
}
async function picnicGroupJoin(req, res) {
  const userId = req.session.user.id;

  let [result] = await pool.execute(
    'SELECT activity_picnic_private.id AS picnic_id , users.name AS creater_id, activity_picnic_private.location, activity_picnic_private.address, activity_picnic_private.activity_date, activity_picnic_state.activity_state, activity_picnic_private.price, activity_picnic_private.join_limit, activity_picnic_private.picnic_title, activity_picnic_private.place_name, activity_picnic_private.intr, activity_picnic_private.img1, activity_picnic_private.start_date,activity_picnic_private.end_date, activity_picnic_private.valid, activity_picnic_private_join.join_user_id FROM activity_picnic_private JOIN activity_picnic_private_join ON activity_picnic_private.id = activity_picnic_private_join.picnic_id JOIN activity_picnic_state ON activity_picnic_private.activity_state=activity_picnic_state.id JOIN users ON activity_picnic_private.create_user_id=users.id WHERE activity_picnic_private_join.join_user_id = ?',
    [userId]
  );

  const perPage = 5;
  const page = req.query.page || 1;
  let total = result.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  result = result.slice(offset, offset + perPage);

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    result,
  });
}
async function picnicGroupCollect(req, res) {
  const userId = req.session.user.id;
  let [collectResult] = await pool.execute(
    'SELECT activity_picnic_private.id AS picnic_id , activity_picnic_private.create_user_id AS creater_id, activity_picnic_private.location, activity_picnic_private.address, activity_picnic_private.activity_date, activity_picnic_private.activity_state, activity_picnic_private.price, activity_picnic_private.join_limit, activity_picnic_private.picnic_title, activity_picnic_private.place_name, activity_picnic_private.intr, activity_picnic_private.img1, activity_picnic_private.start_date,activity_picnic_private.end_date, activity_picnic_private.valid, picnic_private_collect.user_id FROM activity_picnic_private JOIN picnic_private_collect ON activity_picnic_private.id = picnic_private_collect.picnic_id WHERE picnic_private_collect.user_id = ?',
    [userId]
  );

  const perPage = 5;
  const page = req.query.page || 1;
  let total = collectResult.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  collectResult = collectResult.slice(offset, offset + perPage);

  res.json({
    pagination: {
      total,
      perPage,
      page,
      lastPage,
    },
    collectResult,
  });
}
//----------------------- 官方活動 ------------------------
async function getPicnicList(req, res) {
  //   console.log(req.query);
  const searchWord = req.query.searchWord ? req.query.searchWord : '';
  const filterState = req.query.filterState ? req.query.filterState : '';
  const minPrice = req.query.minPrice ? req.query.minPrice : 0;
  const maxPrice = req.query.maxPrice ? req.query.maxPrice : 2500;
  const minJoinPeople = req.query.minJoinPeople ? req.query.minJoinPeople : 0;
  const maxJoinPeople = req.query.maxJoinPeople ? req.query.maxJoinPeople : 30;
  const minDate = req.query.minDate ? req.query.minDate : '';
  const maxDate = req.query.maxDate ? req.query.maxDate : '';
  let activitySort = req.query.activitySort ? req.query.activitySort : '0';

  let sortSql;
  switch (activitySort) {
    case '0':
      sortSql = 'activity_pincnic_official.start_date DESC';
      break;
    case '1':
      sortSql = 'activity_pincnic_official.start_date ASC';
      break;
    case '2':
      sortSql = 'activity_pincnic_official.price DESC';
      break;
    case '3':
      sortSql = 'activity_pincnic_official.price ASC';
      break;
    default:
  }
  // console.log('sortSql', sortSql);

  let filterBtn = filterState ? `AND activity_picnic_state.id = ${filterState}` : '';
  let filterPrice = minPrice || maxPrice ? `AND (price BETWEEN ${minPrice} AND ${maxPrice})` : '';
  let filterJoinPeople = minJoinPeople || maxJoinPeople ? `AND (join_limit BETWEEN ${minJoinPeople} AND ${maxJoinPeople})` : '';
  let filterDate = maxDate || minDate ? `AND (activity_date >= '${minDate}' AND activity_date <= '${maxDate}')` : '';
  //   console.log(filterDate);

  let [totalData] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE valid = 1 ${filterBtn} ${filterPrice} ${filterJoinPeople} ${filterDate} AND activity_pincnic_official.picnic_title LIKE ?`,
    [`%${searchWord}%`]
  );

  const page = req.query.page ? req.query.page : 1;
  const perPage = req.query.perPage ? req.query.perPage : 12;
  let total = totalData.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);
  // console.log(typeof req.query.filterState);

  let [data] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location, IfNULL(c.people,0) AS currentJoin FROM activity_pincnic_official JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id LEFT JOIN (SELECT picnic_id, COUNT(1) AS people FROM activity_picnic_official_join GROUP BY picnic_id) c ON activity_pincnic_official.id = c.picnic_id WHERE valid = 1 ${filterBtn} ${filterPrice} ${filterJoinPeople} ${filterDate} AND activity_pincnic_official.picnic_title LIKE ? ORDER BY ${sortSql} LIMIT ? OFFSET ?`,
    [`%${searchWord}%`, perPage, offset]
  );

  // 比對活動狀態
  data.map(async (data) => {
    let todayDate = Number(moment().format('YYYYMMDD'));
    let startDate = parseInt(data.start_date.replace(/-/g, ''));
    let endDate = parseInt(data.end_date.replace(/-/g, ''));
    // console.log(todayDate, startDate, endDate);
    // console.log(data.id);
    // 狀態初始化
    await pool.execute(`UPDATE activity_pincnic_official SET activity_state = 1 WHERE id = ${data.id}`);
    if (startDate <= todayDate && endDate > todayDate) {
      // 開團中
      await pool.execute(`UPDATE activity_pincnic_official SET activity_state = 2 WHERE id = ${data.id}`);
    }
    if (data.currentJoin >= 5 && data.currentJoin < data.join_limit) {
      // 達到最低人數 變已成團
      await pool.execute(`UPDATE activity_pincnic_official SET activity_state = 3 WHERE id = ${data.id}`);
    }
    if ((startDate < todayDate && endDate < todayDate) || data.currentJoin >= data.join_limit) {
      // 開團已截止
      await pool.execute(`UPDATE activity_pincnic_official SET activity_state = 4 WHERE id = ${data.id}`);
    }
    // console.log(data);
    return data;
  });

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

async function getPicnicDetail(req, res) {
  const officialId = req.params.officialId;
  let [data] = await pool.execute(
    `SELECT activity_pincnic_official.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_pincnic_official
    JOIN activity_picnic_state ON activity_pincnic_official.activity_state = activity_picnic_state.id
    JOIN activity_picnic_location ON activity_pincnic_official.location = activity_picnic_location.id WHERE activity_pincnic_official.id=?`,
    [officialId]
  );
  for (let i = 0; i < data.length; i++) {
    // console.log('data', data[i].id);
    let [currentJoin] = await pool.execute(`SELECT * FROM activity_picnic_official_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], currentJoin: currentJoin.length };
  }

  //參加者
  let [paicipantData] = await pool.execute(
    `SELECT activity_picnic_official_join.*, users.* , activity_pincnic_official.* FROM activity_picnic_official_join
  JOIN users ON activity_picnic_official_join.user_id = users.id 
  JOIN activity_pincnic_official ON activity_pincnic_official.id = activity_picnic_official_join.picnic_id WHERE activity_pincnic_official.id=?`,
    [officialId]
  );

  //推薦商品
  let [productsData] = await pool.execute(
    `SELECT picnic_official_recommend_product.*, product.*, activity_pincnic_official.* FROM picnic_official_recommend_product
  JOIN product ON picnic_official_recommend_product.product_id = product.id 
  JOIN activity_pincnic_official ON picnic_official_recommend_product.picnic_id = activity_pincnic_official.id WHERE activity_pincnic_official.id=?`,
    [officialId]
  );
  // console.log(productsData);
  res.json({ data, paicipantData, productsData });
}

// add join
async function postOfficialJoin(req, res) {
  let picnic = await picnicModel.getJoinId(req.params.officialId);
  console.log(req.params.officialId);
  // console.log(picnic);
  if (!picnic) {
    return res.json({ message: '查無此活動' });
  }

  await picnicModel.addJoinOfficial(req.session.user.id, req.params.officialId);
  let [count] = await picnicModel.getJoinCount(req.params.officialId); //此活動已參加人數
  // console.log('join count people', count.people);
  // 成團標準(最低5人)、成團上限
  let data = await picnicModel.getJoinId(req.params.officialId);
  // console.log('join_limit', data.join_limit);
  if (count.people >= data.join_limit) {
    // 變已截止（人數已滿）
    await pool.execute(`UPDATE activity_pincnic_official SET activity_state = 4 WHERE id = ${req.params.officialId}`);
  } else if (count.people >= 5) {
    // 變已成團
    await pool.execute(`UPDATE activity_pincnic_official SET activity_state = 3 WHERE id = ${req.params.officialId}`);
  }

  let getJoin = await picnicModel.getJoinOfficial(req.session.user.id);
  res.json({ message: 'ok', getJoin, count, data });
  // res.json({ message: 'ok', getJoin });
}
// delete join
async function postOfficiaDeleteJoin(req, res) {
  await picnicModel.deleteJoinOfficial(req.session.user.id, req.params.officialId);
  let count = await picnicModel.getJoinCount(req.params.officialId); //目前參加人數
  let data = await picnicModel.getJoinId(req.params.officialId);
  // console.log('del count people', count);
  // console.log('join_limit', data.join_limit);
  // 取消後未達成團人數
  if (count[0].people < 5) {
    // 成團 -> 開團 變開團中(未達最低人數)
    await pool.execute(`UPDATE activity_pincnic_official SET activity_state = 2 WHERE id = ${req.params.officialId}`);
  } else if (count[0].people < data.join_limit) {
    // 已截止 -> 已成團 變成團中(未達最高上限人數)
    await pool.execute(`UPDATE activity_pincnic_official SET activity_state = 3 WHERE id = ${req.params.officialId}`);
  }

  let getJoin = await picnicModel.getJoinOfficial(req.session.user.id);
  res.json({ message: 'ok delete', getJoin });
}
// add collect
async function postOfficialCollectJoin(req, res) {
  let picnic = await picnicModel.getCollectId(req.params.officialId);
  if (!picnic) {
    return res.json({ message: '查無此活動' });
  }
  await picnicModel.addCollectOfficial(req.session.user.id, req.params.officialId);
  let getCollect = await picnicModel.getCollectOfficial(req.session.user.id); //回覆最新所有收藏資料
  res.json({ message: '加入收藏', getCollect });
}
// delete collect
async function postOfficiaDeleteCollect(req, res) {
  // console.log(req.session);
  await picnicModel.delCollectOfficial(req.session.user.id, req.params.officialId);
  console.log(req.params.officialId);
  let getCollect = await picnicModel.getCollectOfficial(req.session.user.id); //回覆最新所有收藏資料
  res.json({ message: '取消收藏', getCollect });
}

// ----------------------- 開團活動 ----------------------
async function getPrivateList(req, res) {
  const searchWord = req.query.searchWord ? req.query.searchWord : '';
  const filterState = req.query.filterState ? req.query.filterState : '';
  const minJoinPeople = req.query.minJoinPeople ? req.query.minJoinPeople : 0;
  const maxJoinPeople = req.query.maxJoinPeople ? req.query.maxJoinPeople : 30;
  const minDate = req.query.minDate ? req.query.minDate : '';
  const maxDate = req.query.maxDate ? req.query.maxDate : '';
  let activitySort = req.query.activitySort ? req.query.activitySort : '0';

  let sortSql;
  switch (activitySort) {
    case '0':
      sortSql = 'activity_picnic_private.start_date DESC';
      break;
    case '1':
      sortSql = 'activity_picnic_private.start_date ASC';
      break;
    default:
  }

  let filterBtn = filterState ? `AND activity_picnic_state.id = ${filterState}` : '';
  let filterJoinPeople = minJoinPeople || maxJoinPeople ? `AND (join_limit BETWEEN ${minJoinPeople} AND ${maxJoinPeople})` : '';
  let filterDate = maxDate || minDate ? `AND (activity_date >= '${minDate}' AND activity_date <= '${maxDate}')` : '';
  // console.log(minJoinPeople, maxJoinPeople);

  let [totalData] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE valid = 1 ${filterBtn} ${filterJoinPeople} ${filterDate} AND activity_picnic_private.picnic_title LIKE ?`,
    [`%${searchWord}%`]
  );

  const page = req.query.page ? req.query.page : 1;
  const perPage = 12;
  const total = totalData.length;
  let lastPage = Math.ceil(total / perPage);
  const offset = perPage * (page - 1);

  let [data] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE valid = 1 ${filterBtn} ${filterJoinPeople} ${filterDate} AND activity_picnic_private.picnic_title LIKE ? ORDER BY ${sortSql} LIMIT ? OFFSET ?`,
    [`%${searchWord}%`, perPage, offset]
  );
  for (let i = 0; i < data.length; i++) {
    let [currentJoin] = await pool.execute(`SELECT * FROM activity_picnic_private_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], currentJoin: currentJoin.length };
  }
  // console.log(data);
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

async function getPrivateDetail(req, res) {
  const groupId = req.params.groupId;
  let [data] = await pool.execute(
    `SELECT activity_picnic_private.* , activity_picnic_state.activity_state , activity_picnic_location.location FROM activity_picnic_private
    JOIN activity_picnic_state ON activity_picnic_private.activity_state = activity_picnic_state.id
    JOIN activity_picnic_location ON activity_picnic_private.location = activity_picnic_location.id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  for (let i = 0; i < data.length; i++) {
    // console.log('data', data[i].id);
    let [currentJoin] = await pool.execute(`SELECT * FROM activity_picnic_private_join WHERE picnic_id = ${data[i].id}`);
    data[i] = { ...data[i], currentJoin: currentJoin.length };
  }

  //活動主辦人
  let [organiserData] = await pool.execute(
    'SELECT activity_picnic_private.* , users.* FROM activity_picnic_private JOIN users ON activity_picnic_private.create_user_id = users.id WHERE activity_picnic_private.id=?',
    [groupId]
  );

  //活動參與者
  let [paicipantData] = await pool.execute(
    `SELECT activity_picnic_private_join.*, users.* , activity_picnic_private.* FROM activity_picnic_private_join JOIN users ON activity_picnic_private_join.join_user_id = users.id JOIN activity_picnic_private ON activity_picnic_private.id = activity_picnic_private_join.picnic_id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  //推薦商品
  let [productsData] = await pool.execute(
    `SELECT picnic_private_recommend_product.*, product.*, activity_picnic_private.* FROM picnic_private_recommend_product
  JOIN product ON picnic_private_recommend_product.product_id = product.id 
  JOIN activity_picnic_private ON picnic_private_recommend_product.picnic_id = activity_picnic_private.id WHERE activity_picnic_private.id=?`,
    [groupId]
  );

  res.json({ data, organiserData, paicipantData, productsData });
}

// add join
async function postPicnicJoin(req, res) {
  let picnic = await picnicModel.getJoinById(req.params.groupId);
  if (!picnic) {
    return res.json({ message: '查無此活動' });
  }
  // 新增後回傳最新資料
  await picnicModel.addJoinPicnic(req.session.user.id, req.params.groupId);
  let [count] = await picnicModel.getPrivateJoinCount(req.params.groupId); //此活動已參加人數
  // console.log('count people', count.people);
  // 成團標準(最低5人)、成團上限
  let data = await picnicModel.getJoinById(req.params.groupId);
  // console.log('join_limit', data.join_limit);
  if (count.people >= data.join_limit) {
    // 變已截止（人數已滿）
    await pool.execute(`UPDATE activity_picnic_private SET activity_state = 4 WHERE id = ${req.params.groupId}`);
  } else if (count.people >= 5) {
    // 變已成團
    await pool.execute(`UPDATE activity_picnic_private SET activity_state = 3 WHERE id = ${req.params.groupId}`);
  }
  let getJoin = await picnicModel.getJoinPicnic(req.session.user.id);
  res.json({ message: '新增成功', getJoin });
}

// delete join
async function postDeleteJoin(req, res) {
  await picnicModel.deleteJoinPicnic(req.session.user.id, req.params.groupId);
  let [count] = await picnicModel.getPrivateJoinCount(req.params.groupId); //此活動已參加人數
  console.log('count people', count);
  let data = await picnicModel.getJoinById(req.params.groupId);
  if (count.people < 5) {
    // 成團 -> 開團 變開團中(未達最低人數)
    await pool.execute(`UPDATE activity_picnic_private SET activity_state = 2 WHERE id = ${req.params.groupId}`);
  } else if (count.people < data.join_limit) {
    // 已截止 -> 已成團 變成團中(未達最高上限人數)
    await pool.execute(`UPDATE activity_picnic_private SET activity_state = 3 WHERE id = ${req.params.groupId}`);
  }

  let getJoin = await picnicModel.getJoinPicnic(req.session.user.id);
  res.json({ message: '取消成功', getJoin });
}
// add collect
async function postPrivateCollectJoin(req, res) {
  let picnic = await picnicModel.getCollectPrivateId(req.params.groupId);
  if (!picnic) {
    return res.json({ message: '查無此活動' });
  }
  await picnicModel.addCollectPrivate(req.session.user.id, req.params.groupId);
  let getCollect = await picnicModel.getCollectPrivate(req.session.user.id); //回覆最新所有收藏資料
  res.json({ message: '加入收藏', getCollect });
}

// delete collect
async function postPrivateDeleteCollect(req, res) {
  await picnicModel.delCollectPrivate(req.session.user.id, req.params.groupId);
  let getCollect = await picnicModel.getCollectPrivate(req.session.user.id); //回覆最新所有收藏資料
  res.json({ message: '取消收藏', getCollect });
}

// from data
async function getFormData(req, res) {
  console.log(req.body, req.file);

  let filename = req.file ? req.file.filename : '';
  let result = await pool.query(
    'INSERT INTO activity_picnic_private (location ,address, activity_date, join_limit, picnic_title, intr, start_date, end_date, img1, img2,create_user_id, activity_state, valid) VALUES (?,?,?,?,?,?,?,?,?,?,?,1,1)',
    [
      req.body.location,
      req.body.address,
      req.body.activityDate,
      req.body.joinLimit,
      req.body.title,
      req.body.intr,
      req.body.startDate,
      req.body.endDate,
      filename,
      filename,
      req.session.user.id,
    ]
  );

  res.json({ Message: '新增成功' });
  console.log('INSERT new result', result);
}

// update
async function getUpdateFormData(req, res) {
  console.log(req.body, req.file);
  let groupId = req.params.groupId;

  let filename = req.file ? req.file.filename : '';
  let result = await pool.query(
    'UPDATE activity_picnic_private SET location = ? ,address = ? , activity_date = ? , join_limit = ? , picnic_title = ? , intr = ? , start_date = ? , end_date = ? , img1 = ? , img2 = ? ,create_user_id = ? , activity_state = 1 , valid = 1 WHERE id = ?',
    [
      req.body.location,
      req.body.address,
      req.body.activityDate,
      req.body.joinLimit,
      req.body.title,
      req.body.intr,
      req.body.startDate,
      req.body.endDate,
      filename,
      filename,
      req.session.user.id,
      groupId,
    ]
  );

  res.json({ Message: '新增成功' });
  // console.log('INSERT new result', result);
}

// del create from data
async function postPrivateDeleteCreate(req, res) {
  // console.log(req.session);
  await picnicModel.delCreate(req.session.user.id, req.params.groupId);
  res.json({ message: '已刪除活動' });
}

module.exports = {
  getPicnicList,
  getPicnicDetail,
  postOfficialJoin,
  postOfficiaDeleteJoin,
  postOfficialCollectJoin,
  postOfficiaDeleteCollect,
  getPrivateList,
  getPrivateDetail,
  postPicnicJoin,
  postDeleteJoin,
  postPrivateCollectJoin,
  postPrivateDeleteCollect,
  getFormData,
  getMemberPicnicData,
  picnicOffacialCollect,
  picnicOfficalJoin,
  getMemberPicnicGroupData,
  picnicGroupJoin,
  picnicGroupCollect,
  postPrivateDeleteCreate,
  getUpdateFormData,
};
