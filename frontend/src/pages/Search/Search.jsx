import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProperties } from '../../services/propertyService';
import { SaleCard, RentalCard, AuctionCard } from '../Dashboard/Dashboard';
import './Search.css';

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                // Convert search params to a plain object
                const params = Object.fromEntries(searchParams.entries());
                const response = await searchProperties(params);
                
                if (response.data && response.data.success) {
                    setProperties(response.data.data);
                    setPagination({
                        currentPage: response.data.currentPage,
                        totalPages: response.data.totalPages,
                        total: response.data.total
                    });
                }
            } catch (err) {
                console.error("Failed to search properties", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchParams]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setSearchParams((prev) => {
                prev.set('page', newPage);
                return prev;
            });
        }
    };

    const listingType = searchParams.get('listing_type');

    return (
        <div className="search-page">
            <nav className="search-navbar">
                <Link to="/dashboard" className="back-link">
                    &larr; Back to Dashboard
                </Link>
                <h2>Search Results</h2>
            </nav>

            <main className="search-container">
                <div className="search-header">
                    <h3>Found {pagination.total} Properties</h3>
                    {listingType && (
                        <span className="search-badge">
                            {listingType === 'sell' ? 'Buy' : listingType === 'rent' ? 'Rent' : 'Auction'}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="loading-state">Loading results...</div>
                ) : properties.length === 0 ? (
                    <div className="empty-state">
                        <p>No properties found matching your criteria.</p>
                        <Link to="/dashboard" className="btn-primary">Try a different search</Link>
                    </div>
                ) : (
                    <>
                        <div className="results-grid">
                            {properties.map(p => (
                                p.listingType === 'auction' ? (
                                    <AuctionCard key={p._id} a={p} />
                                ) : p.listingType === 'rent' ? (
                                    <RentalCard key={p._id} r={p} />
                                ) : (
                                    <SaleCard key={p._id} p={p} />
                                )
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <button 
                                    className="page-btn" 
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                >
                                    Previous
                                </button>
                                <span className="page-info">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                <button 
                                    className="page-btn" 
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
