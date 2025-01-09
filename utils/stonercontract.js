import { ethers } from "ethers";

// Replace with your Sonic mainnet RPC URL
const provider = new ethers.providers.JsonRpcProvider("SONIC_MAINNET_RPC_URL");

// Replace with your Stoner smart contract address
const contractAddress = "0x9b567e03d891F537b2B7874aA4A3308Cfe2F4FBb";

// Use the provided ABI
const stonerABI = [/* Paste the entire ABI here */];

const stonerContract = new ethers.Contract(contractAddress, stonerABI, provider);

export const fetchAvailableTokens = async (currentPage = 1, limit = 10) => {
  try {
    const totalAvailableIds = await stonerContract.totalAvailableIds();
    const total = Number(totalAvailableIds);

    const start = total - currentPage * limit;
    const end = Math.min(start + limit, total);

    const tokenIds = [];
    for (let i = start; i < end; i++) {
      if (i >= 0) {
        const tokenId = await stonerContract.availableIds(i);
        tokenIds.push(Number(tokenId));
      }
    }

    return { total, tokenIds };
  } catch (error) {
    console.error("Error fetching available tokens:", error);
    throw error;
  }
};

export const fetchTokenMetadata = async (tokenId) => {
  try {
    const tokenURI = await stonerContract.tokenURI(tokenId);
    const response = await fetch(tokenURI);
    return await response.json();
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    throw error;
  }
};
