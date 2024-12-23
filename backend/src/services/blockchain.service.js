const { ethers } = require('ethers');
const GameAssetABI = require('../../../artifacts/contracts/GameAsset.sol/GameAsset.json').abi;
const LRUCache = require('lru-cache');
const config = require('../config');

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.contract = new ethers.Contract(config.contractAddress, GameAssetABI, this.wallet);
    
    this._initializeErrorHandling();

    // Add connection pooling
    this.connectionPool = new Map();
    this.maxConnections = 10;
    
    // Add caching
    this.cache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5, // Time to live: 5 minutes
    });

    // Add batch processing
    this.batchQueue = [];
    this.batchSize = 100;
    this.batchTimeout = 1000;
  }

  _initializeErrorHandling() {
    this.provider.on("error", (error) => {
      console.error("Provider Error:", error);
      this._reconnect();
    });
  }

  async _reconnect() {
    // Implementation
  }

  async createAsset(name, category, rarity) {
    if (!this._validateAssetParams(name, category, rarity)) {
      throw new Error('Invalid asset parameters');
    }
    
    const tx = await this.contract.createAsset(name, category, rarity);
    return await tx.wait();
  }

  _validateAssetParams(name, category, rarity) {
    return name && category && rarity >= 1 && rarity <= 10;
  }

  async transferAsset(assetId, toAddress) {
    return this._executeWithRetry(async () => {
      const tx = await this.contract.transferAsset(assetId, toAddress);
      return await tx.wait();
    });
  }

  async getAssetDetails(assetId) {
    try {
      const asset = await this.contract.assets(assetId);
      return {
        id: asset.id.toString(),
        owner: asset.owner,
        name: asset.name,
        category: asset.category,
        rarity: asset.rarity.toString(),
        createdAt: new Date(asset.createdAt.toNumber() * 1000),
        isTransferable: asset.isTransferable
      };
    } catch (error) {
      throw new Error(`Failed to get asset details: ${error.message}`);
    }
  }

  async getAssetsByOwner(ownerAddress) {
    try {
      const assetIds = await this.contract.getAssetsByOwner(ownerAddress);
      const assets = await Promise.all(
        assetIds.map(id => this.getAssetDetails(id))
      );
      return assets;
    } catch (error) {
      throw new Error(`Failed to get assets by owner: ${error.message}`);
    }
  }

  async _checkConnection() {
    if (!this.isConnected && 
        (!this.lastConnectionAttempt || 
         Date.now() - this.lastConnectionAttempt > this.connectionRetryDelay)) {
      await this._reconnect();
    }
  }

  _handleError(error) {
    if (error.code === 'NETWORK_ERROR') {
      this.isConnected = false;
      this._reconnect();
    }
    throw error;
  }

  async _processBatch() {
    if (this.batchQueue.length >= this.batchSize) {
      const batch = this.batchQueue.splice(0, this.batchSize);
      await this._executeBatch(batch);
    }
  }
}

module.exports = new BlockchainService();