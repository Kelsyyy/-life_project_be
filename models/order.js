const pool = require('../utils/db');

async function getOrderDelivery() {
  let [data] = await pool.execute('SELECT * FROM order_delivery');
  return data;
}

async function getOrderPayment() {
  let [data] = await pool.execute('SELECT * FROM order_payment');
  return data;
}

async function getOrderStatus() {
  let [data] = await pool.execute('SELECT * FROM order_status');
  return data;
}

async function getOrderCount(user, status) {
  let sql = 'SELECT COUNT(*) AS total FROM orders WHERE valid = 1 ';
  let sqlParams = [];
  if (status) {
    sql += 'AND orders.status_id = ?';
    sqlParams.push(status);
  }

  if (user) {
    sql += ' AND orders.user_id = ?';
    sqlParams.push(user);
  }
  console.log('sqlcount', sql);

  let total = await pool.execute(sql, sqlParams);
  return total[0][0].total;
}

async function getOrders(status, user, perPage, offset, id) {
  // console.log(status);
  // console.log(user);
  // console.log(perPage, offset, 'testestsets');
  let sql =
    'SELECT orders.*, users.name AS user_name, order_status.order_status AS order_status, order_delivery.order_delivery AS order_delivery, order_payment.order_payment AS order_payment FROM orders JOIN users ON orders.user_id = users.id JOIN order_status ON orders.status_id = order_status.id JOIN order_delivery ON orders.delivery_id = order_delivery.id JOIN order_payment ON orders.payment_id = order_payment.id WHERE valid = 1 ';
  let sqlParams = [];
  let sqlPages = '';
  if (status) {
    sql += 'AND orders.status_id = ?';
    sqlParams.push(status);
  }
  if (user) {
    sql += ' AND orders.user_id = ?';
    sqlParams.push(user);
  }
  if (id) {
    sql += ' AND orders.id = ?';
    sqlParams.push(id);
  }
  if (perPage && JSON.stringify(offset)) {
    sqlPages += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    sqlParams.push(perPage, offset);
  }
  // console.log('sqlPages', sqlPages);
  // console.log(sqlParams);

  let ordersResult = await pool.execute(sql + sqlPages, sqlParams);
  return ordersResult[0];
}

async function getOrderById() {
  let result = await pool.query(
    'SELECT order_detail.*, product.name AS product_name, product.price AS product_price, product.img AS product_img , activity_camping.title AS camping_title, activity_camping.price AS camping_price, activity_camping.img1 AS camping_img, activity_pincnic_official.picnic_title AS picnic_title, activity_pincnic_official.price AS picnic_price, activity_pincnic_official.img1 AS picnic_img FROM order_detail LEFT JOIN product ON order_detail.product_id = product.id LEFT JOIN activity_camping ON order_detail.camping_id = activity_camping.id LEFT JOIN activity_pincnic_official ON order_detail.picnic_id = activity_pincnic_official.id;'
  );
  // console.log(result);

  return result;
}

async function postOrderById(orderData) {
  let result = await pool.query(
    'INSERT INTO orders (user_id, status_id, delivery_id, payment_id,  order_total, create_time, recipient_name, recipient_phone, recipient_address, recipient_email,memo, point_discount) VALUES (?)',
    [orderData]
  );
  return result;
}

async function postOrderDetailById(cartItem) {
  let result = await pool.query('INSERT INTO order_detail (order_id, product_id, camping_id, picnic_id, quantity) VALUES ?', [cartItem]);
  return result;
}
async function getProductSales(productId) {
  let result = await pool.query(`SELECT inventory, sales FROM product WHERE id in (?)`, [productId]);
  // console.log(productId);
  return result;
}

async function updateProductSales(inventoryResult, salesResult, product_id) {
  let result = await pool.query(`UPDATE product SET inventory = ?, sales = ? WHERE id = ?`, [inventoryResult, salesResult, product_id]);
  return result;
}

module.exports = {
  getOrderDelivery,
  getOrderPayment,
  getOrderStatus,
  getOrderCount,
  getOrders,
  getOrderById,
  postOrderById,
  postOrderDetailById,
  getProductSales,
  updateProductSales,
};
