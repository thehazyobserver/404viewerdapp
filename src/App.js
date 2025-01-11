import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import paintswapImage from './assets/paintswap.svg'; // Update the path as needed
import twitterImage from './assets/x.png'; // Update the path as needed
import telegramImage from './assets/telegram.png'; // Update the path as needed
import passTheJointImage from './assets/PassTheJoint.gif'; // Update the path as needed

const rpcUrl = "https://sonic.drpc.org";
const chainId = 146; // Replace with the correct chain ID for Sonic Mainnet
const contractAddress = "0x9b567e03d891F537b2B7874aA4A3308Cfe2F4FBb";
const abi = [
  {
    inputs: [],
    name: "totalAvailableIds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "availableIds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

function App() {
  const [nfts, setNFTs] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAvailableIds, setTotalAvailableIds] = useState(0);
  const itemsPerPage = 10; // Load 10 items per page

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl, { chainId });
        const contract = new ethers.Contract(contractAddress, abi, provider);

        if (currentPage === 1) {
          const totalIds = await contract.totalAvailableIds();
          setTotalAvailableIds(totalIds.toNumber());
        }

        const startIndex = totalAvailableIds - (currentPage - 1) * itemsPerPage;
        const endIndex = Math.max(startIndex - itemsPerPage, 0);

        const nftPromises = [];
        for (let i = startIndex - 1; i >= endIndex; i--) {
          const id = await contract.availableIds(i);
          nftPromises.push(fetchMetadata(contract, id));
        }

        const nftData = await Promise.all(nftPromises);
        setNFTs((prevNFTs) => [...prevNFTs, ...nftData]);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load NFTs from the blockchain.");
      }
    };

    const fetchMetadata = async (contract, id) => {
      try {
        const tokenURI = await contract.tokenURI(id);
        const httpURI = tokenURI.startsWith("ipfs://")
          ? tokenURI.replace("ipfs://", "https://ftmholidaycelebration.mypinata.cloud/ipfs/")
          : tokenURI;

        const response = await fetch(httpURI);
        if (!response.ok) throw new Error(`Failed to fetch metadata for ID ${id}`);
        const metadata = await response.json();

        return {
          id: id.toString(),
          image: metadata.image.startsWith("ipfs://")
            ? metadata.image.replace("ipfs://", "https://ftmholidaycelebration.mypinata.cloud/ipfs/")
            : metadata.image,
          name: metadata.name,
          description: metadata.description,
          attributes: metadata.attributes,
        };
      } catch (err) {
        console.error(`Error fetching metadata for ID ${id}:`, err);
        return { id: id.toString(), image: null, name: "Unknown NFT", description: "N/A", attributes: [] };
      }
    };

    fetchNFTs();
  }, [currentPage, totalAvailableIds]);

  const loadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>$STONER UPCOMING TOKEN IDS</h1>
        <p>Trade $JOINT for $STONER on Equalizer</p>
        <p>$STONER CA: 0x9b567e03d891F537b2B7874aA4A3308Cfe2F4FBb</p>
        <p>
          View on Paintswap:{" "}
          <a href="https://paintswap.io/sonic/collections/0x9b567e03d891f537b2b7874aa4a3308cfe2f4fbb/nfts" target="_blank" rel="noopener noreferrer">
            https://paintswap.io/sonic/collections/0x9b567e03d891f537b2b7874aa4a3308cfe2f4fbb/nfts
          </a>
        </p>
        <div className="ButtonContainer">
          <a href="https://paintswap.io/sonic/collections/0x9a303054c302b180772a96caded9858c7ab92e99/listings" target="_blank" rel="noopener noreferrer">
            <img src={paintswapImage} alt="PaintSwap" />
          </a>
          <a href="https://x.com/PassThe_JOINT" target="_blank" rel="noopener noreferrer">
            <img src={twitterImage} alt="Twitter" />
          </a>
          <a href="https://t.me/jointonsonic" target="_blank" rel="noopener noreferrer">
            <img src={telegramImage} alt="Telegram" />
          </a>
          <a href="https://passthejoint.netlify.app/" target="_blank" rel="noopener noreferrer">
            <img src={passTheJointImage} alt="Pass the $JOINT" />
          </a>
        </div>
      </header>
      {error ? (
        <div className="error-screen">
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="nft-gallery">
            {nfts.map((nft) => (
              <div key={nft.id} className="nft-card">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} />
                ) : (
                  <div className="placeholder">Image Not Available</div>
                )}
                <h3>{nft.name}</h3>
                <p>{nft.description}</p>
                <ul>
                  {nft.attributes.map((attr, index) => (
                    <li key={index}>
                      {attr.trait_type}: {attr.value}
                    </li>
                  ))}
                </ul>
                <p>ID: #{nft.id}</p>
              </div>
            ))}
          </div>
          {nfts.length < totalAvailableIds && (
            <button onClick={loadMore} className="load-more">
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default App;