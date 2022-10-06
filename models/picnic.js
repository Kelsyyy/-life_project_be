const pool = require('../utils/db');

// ------- 官方活動 join -------
async function getJoinId(officialId) {
  let [result] = await pool.execute('SELECT * FROM activity_pincnic_official WHERE id = ?', [officialId]);
  // console.log(result);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

//add join
async function addJoinOfficial(userId, officialId) {
  let [result] = await pool.execute('INSERT INTO activity_picnic_official_join(user_id, picnic_id) VALUES (?,?)', [userId, officialId]);
  console.log('addJoinOfficial', result);
}

// 抓已參加人數
async function getJoinCount(picnic_id) {
  let [result] = await pool.execute(
    `SELECT activity_picnic_official_join.picnic_id, COUNT(1) AS people FROM activity_picnic_official_join WHERE picnic_id = ? GROUP BY picnic_id`,
    [picnic_id]
  );
  if (result.length < 1) {
    result = [{ people: 0, picnic_id: picnic_id }];
  }
  return result;
}

// 取得會員參加所有活動和細節 給會員API
async function getJoinOfficial(user_id) {
  // console.log(user_id);
  let [result] = await pool.execute(
    'SELECT activity_pincnic_official.id AS picnic_id , activity_pincnic_official.user_id AS creater_id, activity_pincnic_official.location, activity_pincnic_official.address, activity_pincnic_official.activity_date, activity_pincnic_official.activity_state, activity_pincnic_official.price, activity_pincnic_official.join_limit, activity_pincnic_official.picnic_title, activity_pincnic_official.place_name, activity_pincnic_official.intr, activity_pincnic_official.img1, activity_pincnic_official.start_date,activity_pincnic_official.end_date, activity_pincnic_official.valid, activity_picnic_official_join.user_id FROM activity_pincnic_official JOIN activity_picnic_official_join ON activity_pincnic_official.id = activity_picnic_official_join.picnic_id WHERE activity_picnic_official_join.user_id = ?',
    [user_id]
  );
  return result;
}

// delete join
async function deleteJoinOfficial(userId, officialId) {
  let [result] = await pool.execute('DELETE FROM activity_picnic_official_join WHERE user_id = ? AND picnic_id = ?', [userId, officialId]);
  console.log('deleteJoin', result);
}

// 是否有此活動
async function getCollectId(officialId) {
  let [result] = await pool.execute('SELECT * FROM activity_pincnic_official WHERE id = ?', [officialId]);
  // console.log(result);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

// add collect
async function addCollectOfficial(userId, officialId) {
  let [data] = await pool.execute('INSERT INTO picnic_official_collect (user_id, picnic_id) VALUES (?,?)', [userId, officialId]);
  console.log('addCollectOfficial', data);
}

// get all collect 此會員所有收藏
async function getCollectOfficial(userId) {
  // console.log(user_id);
  let [result] = await pool.execute('SELECT * FROM picnic_official_collect WHERE user_id = ?', [userId]);
  return result;
}

// delete collect
async function delCollectOfficial(userId, officialId) {
  let [data] = await pool.execute('DELETE FROM picnic_official_collect WHERE user_id = ? AND picnic_id = ?', [userId, officialId]);
  console.log('delCollectOfficial', data);
}

// ------- 開團活動 join -------
// 確認是否有此活動
async function getJoinById(groupId) {
  let [result] = await pool.execute('SELECT * FROM activity_picnic_private WHERE id = ?', [groupId]);
  // console.log(result);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}
// add join
async function addJoinPicnic(userId, groupId) {
  let [result] = await pool.execute('INSERT INTO activity_picnic_private_join ( join_user_id, picnic_id) VALUES (?,?)', [userId, groupId]);
  console.log('addJoinPicnic', result);
}

// 此會員所有加入活動
async function getJoinPicnic(userId) {
  let [result] = await pool.execute('SELECT * FROM activity_picnic_private_join WHERE join_user_id = ?', [userId]);
  return result;
}
// 抓已參加人數
async function getPrivateJoinCount(groupId) {
  let [result] = await pool.execute(`SELECT activity_picnic_private_join.picnic_id, COUNT(1) AS people FROM activity_picnic_private_join WHERE picnic_id = ? GROUP BY picnic_id`, [
    groupId,
  ]);
  console.log('getPrivateJoinCount', result);
  if (result.length < 1) {
    result = { people: 0, picnic_id: groupId };
  }
  return result;
}

// 取得會員參加所有活動和細節 給會員API
async function getJoinPrivate(user_id) {
  // console.log(user_id);
  let [result] = await pool.execute(
    'SELECT activity_pincnic_private.id AS picnic_id , activity_pincnic_private.user_id AS creater_id, activity_pincnic_private.location, activity_pincnic_private.address, activity_pincnic_private.activity_date, activity_pincnic_private.activity_state, activity_pincnic_private.join_limit, activity_pincnic_private.picnic_title, activity_pincnic_private.place_name, activity_pincnic_private.intr, activity_pincnic_private.img1, activity_pincnic_private.start_date,activity_pincnic_private.end_date, activity_pincnic_private.valid, activity_picnic_private_join.user_id FROM activity_pincnic_private JOIN activity_picnic_private_join ON activity_pincnic_private.id = activity_picnic_private_join.picnic_id WHERE activity_picnic_private_join.user_id = ?',
    [user_id]
  );
  return result;
}

// delete join
async function deleteJoinPicnic(userId, groupId) {
  let [result] = await pool.execute('DELETE FROM activity_picnic_private_join WHERE join_user_id = ? AND picnic_id = ?', [userId, groupId]);
  console.log('deleteJoin', result);
}

// 是否有此活動
async function getCollectPrivateId(groupId) {
  let [result] = await pool.execute('SELECT * FROM activity_picnic_private WHERE id = ?', [groupId]);
  // console.log(result);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

// add collect
async function addCollectPrivate(userId, groupId) {
  let [data] = await pool.execute('INSERT INTO picnic_private_collect (user_id, picnic_id) VALUES (?,?)', [userId, groupId]);
  console.log('addCollectPrivate', data);
}

// get all collect 此會員所有收藏
async function getCollectPrivate(userId) {
  let [result] = await pool.execute('SELECT * FROM picnic_private_collect WHERE user_id = ?', [userId]);
  return result;
}

// delete collect
async function delCollectPrivate(userId, groupId) {
  let [data] = await pool.execute('DELETE FROM picnic_private_collect WHERE user_id = ? AND picnic_id = ?', [userId, groupId]);
  console.log('delCollectPrivate', data);
}

//
async function delCreate(userId, groupId) {
  let [data] = await pool.execute('DELETE FROM activity_picnic_private WHERE create_user_id = ? AND id = ?', [userId, groupId]);
  console.log('delCreate', data);
}

module.exports = {
  getJoinId,
  addJoinOfficial,
  getJoinOfficial,
  deleteJoinOfficial,
  addCollectOfficial,
  getCollectOfficial,
  delCollectOfficial,
  getJoinCount,
  getCollectId,
  getJoinById,
  addJoinPicnic,
  getJoinPicnic,
  deleteJoinPicnic,
  getCollectPrivateId,
  addCollectPrivate,
  getCollectPrivate,
  delCollectPrivate,
  getPrivateJoinCount,
  getJoinPrivate,
  delCreate,
};
