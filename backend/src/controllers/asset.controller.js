const blockchainService = require('../services/blockchain.service');

exports.createAsset = async (req, res, next) => {
  try {
    const { name, category, rarity } = req.body;
    const result = await blockchainService.createAsset(name, category, rarity);
    res.status(200).json({ message: 'Asset created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

exports.transferAsset = async (req, res, next) => {
  try {
    const { assetId, toAddress } = req.body;
    const result = await blockchainService.transferAsset(assetId, toAddress);
    res.status(200).json({ message: 'Asset transferred successfully', data: result });
  } catch (error) {
    next(error);
  }
};

exports.getAssetsByOwner = async (req, res, next) => {
  try {
    const { ownerAddress } = req.params;
    const assets = await blockchainService.getAssetsByOwner(ownerAddress);
    res.status(200).json({ assets });
  } catch (error) {
    next(error);
  }
}; 