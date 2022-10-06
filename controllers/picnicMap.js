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

  let [allResult] = await pool.execute(
    `SELECT * ,( 3959 * acos( cos( radians(25.10542873699434) ) * cos( radians( lat ) ) * cos( radians(lng) - radians(121.52266751703542)) + sin(radians(25.10542873699434)) * sin( radians(lat)))) AS distance FROM activity_map WHERE valid=1 ${typeSelect} ${titleSearch} HAVING distance ${distanceSelect} ORDER BY ${orderType}`
  );
  let allResultL = allResult.length;

  res.json({ allResultL, allResult });
}

// :id
async function getMapId(req, res) {
  const picnicId = req.params.picnicId;
  // console.log('id', picnicId);
  // get asideId
  let [asideIdresult] = await pool.execute(`SELECT * FROM activity_pincnic_official WHERE valid=1 AND id=?`, [picnicId]);

  let [result] = await pool.execute(`SELECT * FROM activity_pincnic_official WHERE valid=1 AND id=?`, [picnicId]);

  // lat,lng
  let [nowLat] = result.map((v) => {
    return v.lat;
  });
  let [nowLng] = result.map((v) => {
    return v.lng;
  });
  // console.log(nowLat, nowLng);

  let [picnicResult] = await pool.execute(
    `SELECT * ,( 3959 * acos( cos( radians(${nowLat}) ) * cos( radians( lat ) ) * cos( radians(lng) - radians(${nowLng})) + sin(radians(${nowLat})) * sin( radians(lat)))) AS distance FROM activity_pincnic_official HAVING distance < 3 ORDER BY distance ASC`
  );

  picnicResult = picnicResult.filter((v) => {
    const newDistance = Math.floor(v.distance);
    return newDistance > 0;
  });

  // picnicResult.map((v) => {
  //   v.location = activityLocation.filter((l) => {
  //     return picnicResult.location === l.id;
  //   });
  // });
  // console.log('location', picnicResult);

  let picnicResultL = picnicResult.length;

  let picnicIds = picnicResult.map((picnic) => picnic.id);
  console.log('picnicIds', picnicIds);

  let [joinResult] = await pool.query(
    `SELECT j.*, users.id, users.name, users.photo FROM activity_picnic_official_join j JOIN users ON j.user_id = users.id WHERE j.picnic_id in (?) order by j.picnic_id`,
    [picnicIds]
  );

  //   // On2
  picnicResult.map((picnic) => {
    picnic.users = joinResult.filter((join) => {
      return join.picnic_id === picnic.id;
    });
  });

  res.json({ picnicResultL, picnicResult, asideIdresult });
}

module.exports = {
  getMapList,
  getMapId,
};
