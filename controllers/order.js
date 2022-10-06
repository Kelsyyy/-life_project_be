const orderModel = require('../models/order');
const moment = require('moment');
const axios = require('axios');
require('dotenv').config();
const { HmacSHA256 } = require('crypto-js');
const Base64 = require('crypto-js/enc-base64');
const qs = require('qs');
const { createLinePayClient } = require('line-pay-merchant');
const { LINEPAY_CHANNEL_ID, LINEPAY_VERSION, LINEPAY_SITE, LINEPAY_CHANNEL_SECRET_KEY, LINPAY_RETURN_HOST, LINEPAY_RETURN_CONFIRM_URL, LINEPAY_RETURN_CANCEL_URL } = process.env;

async function getOrderDeliveryList(req, res) {
  let data = await orderModel.getOrderDelivery();
  res.json(data);
}

async function getOrderPaymentList(req, res) {
  let data = await orderModel.getOrderPayment();
  res.json(data);
}

async function getOrderStatusList(req, res) {
  let data = await orderModel.getOrderStatus();
  res.json(data);
}

async function getOrderList(req, res) {
  let { page, perPage, status } = req.query;
  // console.log(status);

  let user = req.session.user.id;
  // console.log(user);

  // pagination
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  let total = await orderModel.getOrderCount(user, parseInt(status));
  // console.log(total);
  let lastPage = Math.ceil(total / perPage);
  let offset = perPage * (page - 1);

  let data = await orderModel.getOrders(parseInt(status), user, perPage, offset);
  // console.log(total, perPage, page, lastPage, data);

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

async function getOrderDetail(req, res) {
  let id = req.params.id;
  let user = req.session.user.id;
  // console.log(id, user);

  let orderData = await orderModel.getOrders('', user, '', '', id);
  // console.log('orderdata', orderData);

  let [orderInfo] = orderData.map((v, i) => {
    return {
      id: v.id,
      totalPrice: v.order_total,
      time: v.create_time,
      name: v.recipient_name,
      phone: v.recipient_phone,
      address: v.recipient_address,
      email: v.recipient_email,
      memo: v.memo,
      discount: v.point_discount,
    };
  });
  // console.log(orderInfo);

  let data = [{ ...orderInfo, product: [], picnic: [], camping: [] }];

  let cartData = await orderModel.getOrderById();
  // console.log('cart0', cartData[0]);
  cartData[0]
    .filter((v, i) => {
      return v.order_id == id;
    })

    .map((d, i) => {
      // console.log(d);
      data[0].product.push({
        id: d.product_id,
        name: d.product_name,
        quantity: d.quantity,
        price: d.product_price,
        img: d.product_img,
        ischecked: true,
        itemTotal: d.quantity * d.product_price,
      });
      data[0].picnic.push({
        id: d.picnic_id,
        name: d.picnic_title,
        img: d.picnic_img,
        price: d.picnic_price,
        quantity: d.quantity,
        ischecked: true,
        itemTotal: d.quantity * d.picnic_price,
      });
      data[0].camping.push({
        id: d.camping_id,
        name: d.camping_title,
        img: d.camping_img,
        price: d.camping_price,
        quantity: d.quantity,
        ischecked: true,
        itemTotal: d.quantity * d.camping_price,
      });
    });

  // console.log('data', data);
  res.json({ data });
}

async function postOrder(req, res) {
  // console.log('body:', req.body);
  // console.log(req.body.point);
  // insert into orders
  let { delivery, payment, productTotal, picnicTotal, campingTotal, name, phone, email, memo, cityName, areaName, address, point } = req.body;
  // console.log(point);

  let fullAddress = cityName + areaName + address;
  let cartTotal = productTotal + picnicTotal + campingTotal + point;
  let create_time = moment().format('YYYY-MM-DD h:mm:ss');
  let status = 3;

  // console.log(req.session);
  if (req.session.user === null) return;

  let user_id = req.session.user.id;
  // console.log('id', user_id);

  let orderData = [user_id, status, delivery, payment, cartTotal, create_time, name, phone, fullAddress, email, memo, point];

  let insertOrders = await orderModel.postOrderById(orderData);
  // console.log('insertOrders', insertOrders);

  let order_id = insertOrders[0].insertId;
  // console.log('orderId', order_id);

  // insert into detail
  let { productItems, picnicItems, campingItems } = req.body;
  // console.log(prouductItems, picnicItems, campingItems);
  productItems.sort(function (a, b) {
    return a.id - b.id;
  });
  let productCartItem = productItems
    .filter((v) => v.ischecked === true)
    .map((d) => {
      return [order_id, d.id, 0, 0, d.quantity];
    });
  // console.log(productCartItem);

  let campingCartItem = campingItems
    .filter((v) => v.ischecked === true)
    .map((d) => {
      return [order_id, 0, d.id, 0, d.quantity];
    });
  // console.log(campingCartItem);

  let picnicCartItem = picnicItems
    .filter((v) => v.ischecked === true)
    .map((d) => {
      return [order_id, 0, 0, d.id, d.quantity];
    });
  // console.log(picnicCartItem);

  let cartItem = [...productCartItem, ...campingCartItem, ...picnicCartItem];
  // console.log(cartItem);

  let orderDetailResult = await orderModel.postOrderDetailById(cartItem);
  // console.log('orderDetailResult', orderDetailResult);

  // product
  let productId = productCartItem.map((v) => {
    return v[1];
  });
  productItems.sort(function (a, b) {
    return a.id - b.id;
  });
  let productSales = productCartItem.map((v) => {
    return v[4];
  });
  let productResult = await orderModel.getProductSales(productId);
  // let { inventory, sales } = productResult[0];
  // console.log(productResult[0]);
  let productArr = productResult[0];
  let inventory = productArr.map((v) => {
    return v.inventory;
  });
  let sales = productArr.map((v) => {
    return v.sales;
  });
  // console.log('id', productId, 'sales', productSales);
  // console.log('inventory', inventory, 'sales', sales);
  for (let i = 0; i < productId.length; i++) {
    // let inventory = productResult[i].inventory;
    // let sales = productResult[i].sales;
    let inventoryResult = inventory[i] - productSales[i];
    let salesResult = sales[i] + productSales[i];

    // console.log('id', productId[i]);
    // console.log('inventoryResult', inventoryResult);
    // console.log('salesResult', salesResult);

    let updateProductResult = await orderModel.updateProductSales(inventoryResult, salesResult, productId[i]);
  }

  res.json({ order_id });
}

// async function postEcpay(req, res) {
//   // 綠界
//   let user = req.session.user.id;
//   let MerchantId = 3002607;
//   let HashKey = 'pwFHCqoQZGmho4w6';
//   let HashIV = 'EkRm7iFT261dpevs';
//   let EncryptTypt = 1;
//   let PaymentType = 'aio';
//   let MerchantTradeNo = req.body.order_id;
//   // 用id抓訂單資料
//   // getOrders -> time, order_total
//   let orderData = await orderModel.getOrders('', user, '', '', req.body.order_id);
//   let [orderInfo] = orderData.map((v, i) => {
//     return {
//       id: v.id,
//       totalPrice: v.order_total,
//       time: v.create_time,
//     };
//   });
//   // console.log(orderInfo);
//   let MerchantTradeDate = orderInfo.time;
//   let TotalAmount = orderInfo.totalPrice;
//   let TradeDesc = 'nice';
//   let ChoosePayment = 'ALL';
//   let OrderResultURL = 'http://localhost:3000/orderstep/checkout';
//   // get order items ->
//   // let name = {};
//   // let cartData = await orderModel.getOrderById();
//   // // console.log('cart0', cartData[0]);
//   // cartData[0]
//   //   .filter((v, i) => {
//   //     return v.order_id == req.body.order_id;
//   //   })
//   //   .map((d, i) => {
//   //     console.log(d);
//   //     return (name = d.product_name);
//   //   });
//   // console.log(name);
//   let ItemName = 'XX商城商品一批X1';
//   // checkmacvalue
//   let check = [];
//   check.push(HashKey, ChoosePayment, EncryptTypt, ItemName, MerchantId, MerchantTradeDate, MerchantTradeNo, PaymentType, OrderResultURL, TotalAmount, TradeDesc, HashIV);
//   let checkURI = encodeURI(check.join('&'));
//   hash.update(checkURI.toLowerCase());
//   let checkValue = hash.digest('hex');
//   let CheckMacValue = checkValue.toUpperCase();
//   // console.log(CheckMacValue);
//   let data = {
//     MerchantId,
//     HashKey,
//     HashIV,
//     EncryptTypt,
//     PaymentType,
//     MerchantTradeNo,
//     MerchantTradeDate,
//     TotalAmount,
//     TradeDesc,
//     ChoosePayment,
//     OrderResultURL,
//     ItemName,
//     CheckMacValue,
//   };
//   const result = await axios({
//     url: `https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5`,
//     method: 'post',
//     headers: {
//       'content-type': 'application/x-www-form-urlencoded',
//     },
//     data,
//   });
//   console.log(result);
//   // res.send(result);
//   res.render(result);
// }

async function postOrderInfo(req, res) {
  let user = req.session.user.id;
  // console.log(req.body);
  let orderId = req.body.order_id;
  // console.log('orderId', orderId);

  //   // 用id抓訂單資料
  //   // getOrders -> time, order_total
  let orderData = await orderModel.getOrders('', user, '', '', req.body.order_id);
  let [orderInfo] = orderData.map((v, i) => {
    return {
      id: v.id,
      totalPrice: v.order_total,
      time: v.create_time,
    };
  });
  // console.log('orderinfo', orderInfo);
  let TotalAmount = orderInfo.totalPrice;
  // console.log('Totalamount', TotalAmount);

  // get order items ->
  // products -> [{name: xxx, quantity: 1, price: 5}]
  let products = [];
  let cartData = await orderModel.getOrderById();
  // console.log('cart0', cartData[0]);
  cartData[0]
    .filter((v, i) => {
      return v.order_id == req.body.order_id;
    })
    .map((d, i) => {
      // console.log(d);
      if (d.product_name) {
        products.push({ name: d.product_name, quantity: d.quantity, price: d.product_price });
      }
      if (d.picnic_title) {
        products.push({ name: d.picnic_title, quantity: d.quantity, price: d.picnic_price });
      }
      if (d.camping_title) {
        products.push({ name: d.camping_title, quantity: d.quantity, price: d.camping_price });
      }
    });
  // console.log(products);

  const orders = { orderId: orderId, currency: 'TWD', amount: TotalAmount, packages: [{ id: `${user}`, amount: TotalAmount, products: products }] };
  // console.log(orders);
  res.json({ orders });
}

async function postOrderPay(req, respond) {
  // console.log(req.body);
  const { orders } = req.body;
  // console.log(req.body.orders);
  let orderId = orders.orderId;
  let products = orders.packages;
  let amount = orders.amount;
  // // console.log(req.body);
  // // console.log(orders);
  // try {
  //   const linePayBody = {
  //     ...orders,
  //     redirectUrls: {
  //       confirmUrl: 'http://localhost:3000/',
  //       cancelUrl: 'http://localhost:3000/notfound',
  //     },
  //   };
  //   const uri = '/payments/request';
  //   const nonce = orderId;
  //   const string = `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(linePayBody)}${nonce}`;
  //   const signature = Base64.stringify(HmacSHA256(string, LINEPAY_CHANNEL_SECRET_KEY));
  //   // console.log(LINEPAY_CHANNEL_ID);
  //   const headers = {
  //     'X-LINE-ChannelId': LINEPAY_CHANNEL_ID,
  //     'Content-Type': 'application/json',
  //     'X-LINE-Authorization-Nonce': nonce,
  //     'X-LINE-Authorization': signature,
  //   };

  //   const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;

  //   const linePayRes = await axios.post(url, linePayBody, { headers });
  //   console.log(linePayRes);

  //   console.log(linePayBody);
  // } catch (error) {
  //   console.error(error);
  //   respond.end();
  // }

  const linePayClient = createLinePayClient({
    channelId: LINEPAY_CHANNEL_ID,
    channelSecretKey: LINEPAY_CHANNEL_SECRET_KEY,
    env: 'development', // env can be 'development' or 'production'
  });
  try {
    const res = await linePayClient.request.send({
      body: {
        amount: amount,
        currency: 'TWD',
        orderId: orderId,
        packages: products,
        redirectUrls: {
          confirmUrl: 'http://localhost:3001/api/1.0/orders/checkout',
          cancelUrl: 'https://myshop.com/cancelUrl',
        },
      },
    });
    console.log(res);
    // respond.set('Access-Control-Allow-Origin', '*');
    // respond.header('Access-Control-Expose-Headers', 'X-My-Custom-Header');
    // respond.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    // respond.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
    // respond.header('Access-Control-Allow-Headers', 'Origin, X-Requested With,Authorization, Content-Type, Accept');
    // respond.redirect(res.body.info.paymentUrl.web);
    respond.send(res.body.info.paymentUrl.web);
    // console.log(res.body.info.paymentUrl.web);
  } catch (e) {
    console.log('error', e);
  }
  // console.log(respond);
}

async function getCheckout(req, res) {
  const { transactionId, orderId } = req.query;
  // console.log(transactionId, orderId);
  req.session.order = orderId;
  res.redirect('http://localhost:3000/orderstep/ordercheck');
}
module.exports = { getOrderDeliveryList, getOrderPaymentList, getOrderStatusList, getOrderList, getOrderDetail, postOrder, postOrderInfo, postOrderPay, getCheckout };
