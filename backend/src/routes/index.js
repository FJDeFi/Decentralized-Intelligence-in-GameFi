const express = require('express');
const assetRoutes = require('./asset.routes');

const router = express.Router();

router.use('/assets', assetRoutes);

module.exports = router; 