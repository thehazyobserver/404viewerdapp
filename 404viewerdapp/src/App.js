import React, { useState, useEffect } from "react";
import NFTCard from "./components/NFTCard";
import { fetchAvailableTokens, fetchTokenMetadata } from "./utils/stonerContract";
import "./App.css"; // Make sure you have a basic App.css file for styling.

export default function App() {
  const [nfts, setNFTs] = useState([]); // Store the fetched NFTs
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const limit = 10; // Number of NFTs to fetch per page

  // Fetch NFTs whenever the page changes
  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);
      setError(null);

      try {
        const { total, tokenIds } = await fetchAvailableTokens(currentPage, limit); // Fetch token IDs
        const metadataList = await Promise.all(
          tokenIds.map(async (id) => {
            const metadata = await fetchTokenMetadata(id); // Fetch metadata for each token
            return { id, ...metadata };
          })
        );

        setNFTs((prevNFTs) => [...prevNFTs, ...metadataList]); // Append new NFTs to the list
      } catch (err) {
        console.error(err);
        setError("Failed to load NFTs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [currentPage]);

  const loadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1); // Increment the page
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Available NFTs</h1>
      <div className="nft-grid">
        {nfts.map((nft) => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <button className="load-more-button" onClick={loadMore} disabled={loading}>
          Load More
        </button>
      )}
    </div>
  );
}
