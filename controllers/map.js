const pool = require('../utils/db');

// /api/1.0/map?type=1 & distance=1
async function getMapList(req, res) {
  const { type, distance, search, order } = req.query;

  let typeSelect = type ? `AND type=${type}` : '';
  let distanceSelect = distance ? `${distance}` : '';
  let titleSearch = search ? `AND (title LIKE '%${search}%' OR address LIKE '%${search}%')` : '';

  let orderType = null;
  switch (order) {
    case '1':
      orderType = 'distance ASC';
      break;
    case '2':
      orderType = 'distance DESC';
      break;
    default:
      orderType = 'id ASC';
  }
  //distance
  // let [disResult] = await pool.execute(
  //   `SELECT *,( 3959 * acos( cos( radians(25.0259029) ) * cos( radians( lat ) ) * cos( radians(lng) - radians(121.5703875)) + sin(radians(25.0259029)) * sin( radians(lat)))) AS distance FROM activity_map WHERE valid = 1 HAVING distance < 2 `
  // );
  // const disLength = disResult.length;

  // result
  // let [result] = await pool.execute(`SELECT * FROM activity_map WHERE valid=1 ${typeSelect}`);

  let [allResult] = await pool.execute(
    `SELECT * ,( 3959 * acos( cos( radians(25.10542873699434) ) * cos( radians( lat ) ) * cos( radians(lng) - radians(121.52266751703542)) + sin(radians(25.10542873699434)) * sin( radians(lat)))) AS distance FROM activity_map WHERE valid=1 ${typeSelect} ${titleSearch} HAVING distance ${distanceSelect} ORDER BY ${orderType}`
  );
  let allResultL = allResult.length;

  res.json({ allResultL, allResult });
}

// :id
async function getMapId(req, res) {
  const campingId = req.params.campingId;

  // get asideId
  let [asideIdresult] = await pool.execute(`SELECT * FROM activity_camping WHERE valid=1 AND id=?`, [campingId]);

  let [result] = await pool.execute(`SELECT * FROM activity_camping WHERE valid=1 AND id=?`, [campingId]);

  // lat,lng
  let [nowLat] = result.map((v) => {
    return v.lat;
  });
  let [nowLng] = result.map((v) => {
    return v.lng;
  });

  // console.log(nowLat, nowLng);

  let [campingResult] = await pool.execute(
    `SELECT * ,( 3959 * acos( cos( radians(${nowLat}) ) * cos( radians( lat ) ) * cos( radians(lng) - radians(${nowLng})) + sin(radians(${nowLat})) * sin( radians(lat)))) AS distance FROM activity_camping WHERE valid = 1 HAVING distance < 20 ORDER BY distance ASC`
  );

  campingResult = campingResult.filter((v) => {
    const newDistance = Math.floor(v.distance);
    return newDistance > 0;
  });

  let campingResultL = campingResult.length;

  let campingIds = campingResult.map((camping) => camping.id);
  // console.log('campingIds', campingIds);

  let [joinResult] = await pool.query(
    `SELECT j.*, users.id, users.name, users.photo FROM activity_camping_join j JOIN users ON j.user_id = users.id WHERE j.activity_id in (?) order by j.activity_id`,
    [campingIds]
  );

  // On2
  campingResult.map((camping) => {
    camping.users = joinResult.filter((join) => {
      return join.activity_id === camping.id;
    });
  });

  res.json({ campingResultL, campingResult, asideIdresult });
}

module.exports = {
  getMapList,
  getMapId,
};
