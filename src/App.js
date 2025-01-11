import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

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
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl, { chainId });
        const contract = new ethers.Contract(contractAddress, abi, provider);

        if (currentPage === 1) {
          const totalIds = await contract.totalAvailableIds();
          setTotalAvailableIds(totalIds);
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalAvailableIds);

        const nftPromises = [];
        for (let i = startIndex; i < endIndex; i++) {
          const id = await contract.availableIds(i);
          nftPromises.push(fetchMetadata(contract, id));
        }

        const nftData = await Promise.all(nftPromises);
        setNFTs((prevNFTs) => [...prevNFTs, ...nftData.reverse()]);
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