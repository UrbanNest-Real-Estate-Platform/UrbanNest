import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import { SaleCard, RentalCard, AuctionCard } from '../../components/PropertyCards/PropertyCards';
import { getSavedProperties, getMyListings } from '../../services/userService';
import { deleteProperty } from '../../services/propertyService';
import './MyProperties.css';

export default function MyProperties() {
  // useSearchParams is used to get the query parameters from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'saved');

  const [savedProperties, setSavedProperties] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [listingStats, setListingStats] = useState({ totalListings: 0, pendingOffers: 0 });
  const [loading, setLoading] = useState(true);

  // Sync tab state with URL
  useEffect(() => {
    const tab = searchParams.get('tab') || 'saved';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'saved') {
          const res = await getSavedProperties();
          if (res.data && res.data.success) {
            setSavedProperties(res.data.data);
          }
        } else if (activeTab === 'listings') {
          const res = await getMyListings();
          if (res.data && res.data.success) {
            setMyListings(res.data.data);
            setListingStats(res.data.stats || { totalListings: 0, pendingOffers: 0 });
          }
        }
      } catch (error) {
        console.error("Error fetching properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const navigate = useNavigate();

  const handleUnsave = (id) => {
    setSavedProperties(prev => prev.filter(p => p._id !== id));
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      try {
        const res = await deleteProperty(id);
        if (res.data.success) {
          toast.success("Property deleted successfully");
          // Refetch to cleanly update total listings and pending offers count
          const fetchRes = await getMyListings();
          if (fetchRes.data && fetchRes.data.success) {
            setMyListings(fetchRes.data.data);
            setListingStats(fetchRes.data.stats || { totalListings: 0, pendingOffers: 0 });
          }
        }
      } catch (error) {
        toast.error("Failed to delete property");
      }
    }
  };

  return (
    <div className="my-properties-page">
      <DashboardNavbar scrolled={true} />

      <main className="my-properties-container">
        <div className="my-properties-header">
          <h1>Property Management</h1>
          <p>Manage your saved properties and personal listings all in one place.</p>
        </div>

        <div className="my-properties-tabs">
          <button
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => handleTabChange('saved')}
          >
            Saved Properties
          </button>
          <button
            className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => handleTabChange('listings')}
          >
            My Listings
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : activeTab === 'saved' ? (
          <div className="saved-properties-view">
            {savedProperties.length === 0 ? (
              <div className="empty-state">
                <h3>No Saved Properties</h3>
                <p>You haven't saved any properties yet. Start exploring!</p>
                <Link to="/dashboard" className="btn-primary">Explore Properties</Link>
              </div>
            ) : (
              <div className="properties-grid">
                {savedProperties.map(p => (
                  p.listingType === 'auction' ? (
                    <AuctionCard key={p._id} a={p} />
                  ) : p.listingType === 'rent' ? (
                    <RentalCard key={p._id} r={p} isInitiallySaved={true} onUnsave={handleUnsave} />
                  ) : (
                    <SaleCard key={p._id} p={p} isInitiallySaved={true} onUnsave={handleUnsave} />
                  )
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="my-listings-view">
            <div className="listings-summary">
              <div className="summary-card">
                <div className="summary-title">Total Active Listings</div>
                <div className="summary-value">{listingStats.totalListings}</div>
              </div>
              <div className="summary-card">
                <div className="summary-title">Received Offers</div>
                <div className="summary-value">{listingStats.pendingOffers}</div>
              </div>
              <div className="summary-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Link to="/post-property" className="btn-primary" style={{ height: 'fit-content' }}>
                  + Post New Property
                </Link>
              </div>
            </div>

            {myListings.length === 0 ? (
              <div className="empty-state">
                <h3>No Listings Yet</h3>
                <p>You haven't posted any properties for sale, rent, or auction.</p>
                <Link to="/post-property" className="btn-primary">Create Your First Listing</Link>
              </div>
            ) : (
              <div className="properties-grid">
                {myListings.map(p => (
                  p.listingType === 'auction' ? (
                    <AuctionCard key={p._id} a={p} isOwner={true} onDelete={handleDeleteProperty} onEdit={(id) => navigate(`/edit-property/${id}`)} />
                  ) : p.listingType === 'rent' ? (
                    <RentalCard key={p._id} r={p} isOwner={true} onDelete={handleDeleteProperty} onEdit={(id) => navigate(`/edit-property/${id}`)} />
                  ) : (
                    <SaleCard key={p._id} p={p} isOwner={true} onDelete={handleDeleteProperty} onEdit={(id) => navigate(`/edit-property/${id}`)} />
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
