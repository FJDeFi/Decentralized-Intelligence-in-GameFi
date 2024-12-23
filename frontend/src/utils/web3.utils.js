import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch (error) {
    throw new Error('Failed to connect wallet: ' + error.message);
  }
};

export const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}; 