const express = require('express');
const router = express.Router();
const mapController = require('../controllers/picnicMap');

router.get('/', mapController.getMapList);

router.get('/:picnicId', mapController.getMapId);

module.exports = router;
