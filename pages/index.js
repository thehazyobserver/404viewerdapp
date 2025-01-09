import { useState, useEffect } from "react";
import { fetchAvailableTokens, fetchTokenMetadata } from "../utils/stonercontract.js";

export default function Home() {
  const [nfts, setNFTs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const limit = 10; // Number of NFTs to fetch per page

  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);
      setError(null);

      try {
        const { total, tokenIds } = await fetchAvailableTokens(currentPage, limit);
        const metadataList = await Promise.all(
          tokenIds.map(async (id) => {
            const metadata = await fetchTokenMetadata(id);
            return { id, ...metadata };
          })
        );

        setNFTs((prevNFTs) => [...prevNFTs, ...metadataList]);
      } catch (err) {
        console.error(err);
        setError("Failed to load NFTs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [currentPage]);

  const loadMore = () => setCurrentPage((prevPage) => prevPage + 1);

  return (
    <div className="container">
      <h1>Available NFTs</h1>
      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={nft.id} className="nft-card">
            <img src={nft.image} alt={nft.name} />
            <h2>{nft.name}</h2>
            <p>{nft.description}</p>
          </div>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <button onClick={loadMore} disabled={loading}>
          Load More
        </button>
      )}
    </div>
  );
}
