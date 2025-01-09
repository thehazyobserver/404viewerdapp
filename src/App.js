import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [nfts, setNFTs] = useState([]); // State to store NFTs
  const [error, setError] = useState(null); // State to store errors

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // Replace this with your actual blockchain API or contract call
        const response = await fetch("https://fake-blockchain-api.com/data"); 
        if (!response.ok) {
          throw new Error("Failed to fetch blockchain data");
        }
        const data = await response.json();
        setNFTs(data); // Set the fetched NFT data
      } catch (err) {
        console.error(err);
        setError("Unable to load blockchain data."); // Set error state
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div className="App">
      {error ? (
        <div className="error-screen">
          <div className="background-image"></div>
          <h1>Oops! Something went wrong.</h1>
          <p>{error}</p>
        </div>
      ) : (
        <div className="nft-gallery">
          {nfts.length > 0 ? (
            nfts.map((nft, index) => (
              <div key={index} className="nft-card">
                <img src={nft.image} alt={nft.name} />
                <h3>{nft.name}</h3>
              </div>
            ))
          ) : (
            <p>Loading NFTs...</p> // Show loading text while NFTs are being fetched
          )}
        </div>
      )}
    </div>
  );
}

export default App;
