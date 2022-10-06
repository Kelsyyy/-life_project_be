const pool = require('../utils/db');

// 是否有 activityId
async function getCampingById(campingId) {
  let [result] = await pool.execute('SELECT * FROM activity_camping WHERE id = ?', [campingId]);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

// add
async function addCollectCamping(userId, campingId) {
  let [result] = await pool.execute('INSERT INTO activity_camping_collect (user_id, activity_id) VALUES (?,?)', [userId, campingId]);
  console.log('collect', result);
}

async function getCollectCamping(userId) {
  let [result] = await pool.execute('SELECT * FROM activity_camping_collect WHERE user_id = ?', [userId]);
  return result;
}

// delete
async function deleteCollectCamping(userId, campingId) {
  let [result] = await pool.execute('DELETE FROM activity_camping_collect WHERE user_id = ? AND activity_id = ?', [userId, campingId]);
  console.log('collect', result);
}
// -------------
// 是否有 activityId
async function getJoinById(campingId) {
  let [result] = await pool.execute('SELECT * FROM activity_camping_join WHERE id = ?', [campingId]);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}
// add join
async function addJoinCamping(userId, campingId) {
  let [result] = await pool.execute('INSERT INTO activity_camping_join (user_id, activity_id) VALUES (?,?)', [userId, campingId]);
  console.log('addjoin', result);
}

async function getJoinCamping(userId) {
  let [result] = await pool.execute('SELECT * FROM activity_camping_join WHERE user_id = ?', [userId]);
  return result;
}

async function deleteJoinCamping(userId, campingId) {
  let [result] = await pool.execute('DELETE FROM activity_camping_join WHERE user_id = ? AND activity_id = ?', [userId, campingId]);
  console.log('joinDel', result);
}

// user collect
async function getCollectUser(userId) {
  let [collectResult] = await pool.execute('SELECT * FROM activity_camping_collect WHERE user_id = ?', [userId]);
  if (!collectResult) {
    return [];
  }
  let campingIds = collectResult.map((users) => users.activity_id);

  console.log(userId);
  console.log(collectResult);
  let [result] = await pool.query(`SELECT * FROM activity_camping WHERE id in (?)`, [campingIds]);
  return result;
}

module.exports = { getCampingById, addCollectCamping, getCollectCamping, deleteCollectCamping, getJoinById, addJoinCamping, getJoinCamping, deleteJoinCamping, getCollectUser };
