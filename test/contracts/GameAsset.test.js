const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameAsset", function() {
  let GameAsset;
  let gameAsset;
  let owner;
  let addr1;

  beforeEach(async function() {
    GameAsset = await ethers.getContractFactory("GameAsset");
    [owner, addr1] = await ethers.getSigners();
    gameAsset = await GameAsset.deploy();
    await gameAsset.deployed();
  });

  describe("Asset Creation", function() {
    it("Should create a new asset", async function() {
      await gameAsset.createAsset("Sword", "Weapon", 5);
      const asset = await gameAsset.assets(1);
      expect(asset.name).to.equal("Sword");
      expect(asset.category).to.equal("Weapon");
      expect(asset.rarity).to.equal(5);
    });
  });

  describe("Asset Transfer", function() {
    it("Should fail when transferring non-owned asset", async function() {
      await gameAsset.createAsset("Sword", "Weapon", 5);
      await expect(
        gameAsset.connect(addr1).transferAsset(1, owner.address)
      ).to.be.revertedWith("You do not own this asset.");
    });

    it("Should emit transfer event", async function() {
      await gameAsset.createAsset("Sword", "Weapon", 5);
      await expect(gameAsset.transferAsset(1, addr1.address))
        .to.emit(gameAsset, "AssetTransferred")
        .withArgs(1, owner.address, addr1.address);
    });
  });

  describe("Batch Operations", function() {
    it("Should create multiple assets in one transaction", async function() {
      const names = ["Sword", "Shield", "Potion"];
      const categories = ["Weapon", "Defense", "Consumable"];
      const rarities = [5, 4, 3];
      
      await gameAsset.batchCreateAssets(names, categories, rarities);
      
      // Verify all assets were created
      for(let i = 1; i <= 3; i++) {
        const asset = await gameAsset.assets(i);
        expect(asset.name).to.equal(names[i-1]);
      }
    });
  });

  // Add fuzz testing
  describe("Fuzz Testing", function() {
    it("Should handle random inputs safely", async function() {
      const randomString = () => Math.random().toString(36).substring(7);
      const randomRarity = () => Math.floor(Math.random() * 15) + 1;
      
      for(let i = 0; i < 100; i++) {
        const name = randomString();
        const category = randomString();
        const rarity = randomRarity();
        
        if(rarity > 10 || rarity < 1) {
          await expect(
            gameAsset.createAsset(name, category, rarity)
          ).to.be.revertedWithCustomError(gameAsset, 'InvalidRarity')
            .withArgs(rarity);
        } else {
          await expect(
            gameAsset.createAsset(name, category, rarity)
          ).to.emit(gameAsset, 'AssetCreated');
        }
      }
    });
  });
});