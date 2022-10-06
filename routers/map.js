const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map');

router.get('/', mapController.getMapList);

router.get('/:campingId', mapController.getMapId);

module.exports = router;
