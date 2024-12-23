const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('GameAsset', () => {
  let GameAsset;
  let gameAsset;
  let owner;
  let addr1;

  beforeEach(async () => {
    GameAsset = await ethers.getContractFactory('GameAsset');
    [owner, addr1] = await ethers.getSigners();
    gameAsset = await GameAsset.deploy();
    await gameAsset.deployed();
  });

  describe('Asset Creation', () => {
    it('Should create a new asset', async () => {
      await gameAsset.createAsset('Sword', 'Weapon', 5);
      const asset = await gameAsset.assets(1);
      expect(asset.name).to.equal('Sword');
      expect(asset.category).to.equal('Weapon');
      expect(asset.rarity).to.equal(5);
    });
  });
}); 