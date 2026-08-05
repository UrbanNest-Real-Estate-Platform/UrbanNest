import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import { SaleCard, RentalCard, AuctionCard } from '../../components/PropertyCards/PropertyCards';
import { getSavedProperties, getMyListings, getMyRents, getPendingRequests } from '../../services/userService';
import { deleteProperty, reviewPropertyRequest } from '../../services/propertyService';
import OffersManagementModal from './components/OffersManagementModal';
import './MyProperties.css';

export default function MyProperties() {
  // useSearchParams is used to get the query parameters from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'saved');

  const [savedProperties, setSavedProperties] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myRents, setMyRents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [listingStats, setListingStats] = useState({ totalListings: 0, pendingOffers: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPropertyForOffers, setSelectedPropertyForOffers] = useState(null);

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
          const listingsRes = await getMyListings();
          const requestsRes = await getPendingRequests();
          if (listingsRes.data && listingsRes.data.success) {
            setMyListings(listingsRes.data.data);
            setListingStats(listingsRes.data.stats || { totalListings: 0, pendingOffers: 0 });
          }
          if (requestsRes.data && requestsRes.data.success) {
            setPendingRequests(requestsRes.data.data);
          }
        } else if (activeTab === 'rents') {
          const res = await getMyRents();
          if (res.data && res.data.success) {
            // MyRents returns an array of Tenancy objects
            // Map them to mimic property objects for the cards if needed, or pass them down differently
            setMyRents(res.data.data);
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

  const handleReviewRequest = async (requestId, status) => {
    try {
      const res = await reviewPropertyRequest(requestId, status);
      if (res.data.success) {
        toast.success(res.data.message);
        // Remove from pending list
        setPendingRequests(prev => prev.filter(r => r._id !== requestId));

        // If approved ownership transfer, it might change listings
        if (status === 'APPROVED') {
          const listingsRes = await getMyListings();
          if (listingsRes.data && listingsRes.data.success) {
            setMyListings(listingsRes.data.data);
            setListingStats(listingsRes.data.stats || { totalListings: 0, pendingOffers: 0 });
          }
        }
      }
    } catch (error) {
      toast.error("Failed to process request");
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
          <button
            className={`tab-btn ${activeTab === 'rents' ? 'active' : ''}`}
            onClick={() => handleTabChange('rents')}
          >
            My Rents
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
        ) : activeTab === 'listings' ? (
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

            {pendingRequests.length > 0 && (
              <div className="pending-requests-section" style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Pending Requests</h2>
                <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingRequests.map(req => (
                    <div key={req._id} style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0' }}>{req.requestType === 'tenancy' ? 'Tenancy Request' : req.requestType === 'vacancy' ? 'Vacancy Request' : 'Ownership Transfer'} - {req.propertyId.title}</h4>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#4b5563' }}><strong>From:</strong> {req.requesterId.name} ({req.requesterId.email})</p>
                        {req.offerPrice && <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}><strong>Accepted Offer Price:</strong> ₹{req.offerPrice.toLocaleString('en-IN')}</p>}
                        {req.message && <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#4b5563' }}><strong>Note:</strong> {req.message}</p>}
                        {req.requestType === 'tenancy' && req.startDate && req.endDate && (
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>
                            <strong>Period:</strong> {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={() => handleReviewRequest(req._id, 'APPROVED')} style={{ background: '#10b981', padding: '6px 12px' }}>Approve</button>
                        <button className="btn-primary" onClick={() => handleReviewRequest(req._id, 'REJECTED')} style={{ background: '#ef4444', padding: '6px 12px' }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 style={{ fontSize: '1.25rem', marginTop: '2rem', marginBottom: '1rem' }}>Your Properties</h2>
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
                    <SaleCard key={p._id} p={p} isOwner={true} onDelete={handleDeleteProperty} onEdit={(id) => navigate(`/edit-property/${id}`)} onViewOffers={(id) => setSelectedPropertyForOffers(id)} />
                  )
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="my-rents-view">
            {myRents.length === 0 ? (
              <div className="empty-state">
                <h3>No Active Rents</h3>
                <p>You are not currently renting any properties on UrbanNest.</p>
                <Link to="/search?listing_type=rent" className="btn-primary">Explore Rentals</Link>
              </div>
            ) : (
              <div className="properties-grid">
                {myRents.map(tenancy => {
                  const msPerDay = 1000 * 60 * 60 * 24;
                  const totalDays = Math.round((new Date(tenancy.endDate) - new Date(tenancy.startDate)) / msPerDay);
                  const totalRent = Math.round((tenancy.monthlyRent / 30) * totalDays);
                  return (
                    <div key={tenancy._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <RentalCard r={tenancy.propertyId} />
                      <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem' }}>
                        <p style={{ margin: '0 0 4px 0' }}><strong>Rent:</strong> ₹{tenancy.monthlyRent.toLocaleString('en-IN')}/mo</p>
                        <p style={{ margin: '0 0 4px 0' }}><strong>Lease Start:</strong> {new Date(tenancy.startDate).toLocaleDateString()}</p>
                        <p style={{ margin: '0 0 4px 0' }}><strong>Lease End:</strong> {new Date(tenancy.endDate).toLocaleDateString()}</p>
                        <p style={{ margin: 0, color: '#10b981' }}><strong>Total Rent for Term:</strong> ₹{totalRent.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {selectedPropertyForOffers && (
        <OffersManagementModal
          propertyId={selectedPropertyForOffers}
          onClose={() => setSelectedPropertyForOffers(null)}
          onOfferStatusChange={async () => {
            const fetchRes = await getMyListings();
            if (fetchRes.data && fetchRes.data.success) {
              setMyListings(fetchRes.data.data);
              setListingStats(fetchRes.data.stats || { totalListings: 0, pendingOffers: 0 });
            }
          }}
        />
      )}
    </div>
  );
}
