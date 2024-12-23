const { ethers } = require('hardhat');

async function main() {
  const GameAsset = await ethers.getContractFactory("GameAsset");
  const gameAsset = await GameAsset.deploy();
  await gameAsset.deployed();

  console.log("GameAsset deployed to:", gameAsset.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 