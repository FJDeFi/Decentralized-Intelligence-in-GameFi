const express = require('express');
const assetController = require('../controllers/asset.controller');
const router = express.Router();

router.post('/create-asset', assetController.createAsset);
router.post('/transfer-asset', assetController.transferAsset);
router.get('/assets/:ownerAddress', assetController.getAssetsByOwner);

module.exports = router; 