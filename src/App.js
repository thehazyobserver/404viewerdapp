import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const rpcUrl = "https://rpc.soniclabs.com";
const contractAddress = "0xYourSmartContractAddress"; // Replace with your contract address
const abi = [
  {
    "inputs": [],
    "name": "totalAvailableIds",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "availableIds",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [nfts, setNFTs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        // Get total available IDs
        const totalAvailableIds = await contract.totalAvailableIds();
        const nftPromises = [];

        // Fetch all available IDs and their metadata
        for (let i = 0; i < totalAvailableIds; i++) {
          const id = await contract.availableIds(i);
          nftPromises.push(fetchMetadata(contract, id));
        }

        // Resolve all metadata promises
        const nftData = await Promise.all(nftPromises);
        setNFTs(nftData);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        if (err.code === 'UNSUPPORTED_OPERATION') {
          setError("The network does not support ENS. Please connect to a supported network.");
        } else {
          setError("Failed to load NFTs from the blockchain.");
        }
      }
    };

    const fetchMetadata = async (contract, id) => {
      try {
        const tokenURI = await contract.tokenURI(id);
        const response = await fetch(tokenURI);
        const metadata = await response.json();
        return {
          id: id.toString(),
          image: metadata.image,
          name: metadata.name,
        };
      } catch (err) {
        console.error(`Error fetching metadata for ID ${id}:`, err);
        return { id: id.toString(), image: null, name: "Unknown NFT" };
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div className="App">
      {error ? (
        <div className="error-screen">
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      ) : (
        <div className="nft-gallery">
          {nfts.map((nft) => (
            <div key={nft.id} className="nft-card">
              <img src={nft.image} alt={nft.name} />
              <h3>{nft.name}</h3>
              <p>ID: #{nft.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;