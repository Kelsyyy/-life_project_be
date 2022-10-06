const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');

// GET orders /api/1.0/orders?sort=1&status=1&user=1&page=1&perPage=5
router.get('/', orderController.getOrderList);

// GET order_delivery
router.get('/delivery', orderController.getOrderDeliveryList);

// GET order_payment
router.get('/payment', orderController.getOrderPaymentList);

// GET order_status
router.get('/status', orderController.getOrderStatusList);

// post ordreinfo /api/1.0/orders/orderinfo
router.post('/orderinfo', orderController.postOrderInfo);

// POST LinePay
router.post('/pay', orderController.postOrderPay);

// GET LinePay Return
router.get('/checkout', orderController.getCheckout);

// POST order /api/1.0/orders/order
router.post('/order', orderController.postOrder);

// GET detail /api/1.0/orders/5
router.get('/:id', orderController.getOrderDetail);

// POST ecpay /api/1.0/orders/pay
// router.post('/ecpay', orderController.postEcpay);

module.exports = router;
