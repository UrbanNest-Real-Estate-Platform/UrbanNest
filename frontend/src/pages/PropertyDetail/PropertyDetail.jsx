import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import { toast } from 'react-toastify';
import { deleteProperty } from '../../services/propertyService';
import { markRecentlyViewed } from '../../services/userService';
import './PropertyDetail.css';

// Import subcomponents
import LocationMap from './components/LocationMap';
import FinancialCalculator from './components/FinancialCalculator';
import AppreciationBadge from './components/AppreciationBadge';
import OfferModal from './components/OfferModal';

import ProjectBanner from './components/ProjectBanner';
import SalesHistoryTimeline from './components/SalesHistoryTimeline';
import PropertyRequestModal from './components/PropertyRequestModal';

// Icons
const IconMapPin = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
)
const IconBed = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
    </svg>
)
const IconBath = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6L9 2" /><path d="M9 6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2" /><path d="M2 16a10 10 0 0 0 20 0v-4H2v4z" />
    </svg>
)
const IconSquare = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
)
const IconHeart = ({ filled }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
)
const IconShare = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
)

export default function PropertyDetail() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [existingOffer, setExistingOffer] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPropertyAndUser = async () => {
            try {
                const propertyRes = await api.get(`/properties/${id}`);
                if (propertyRes.data.success) {
                    setProperty(propertyRes.data.data);
                }

                // Fetch user to check saved properties
                try {
                    const userRes = await api.get('/auth/me');
                    if (userRes.data.success) {
                        setCurrentUser(userRes.data.user);
                        if (userRes.data.user.savedPropertyIds) {
                            setIsSaved(userRes.data.user.savedPropertyIds.includes(id));
                        }
                        
                        // Mark as recently viewed
                        try {
                            await markRecentlyViewed(id);
                        } catch (err) {
                            console.log("Failed to mark property as recently viewed");
                        }
                        
                        // Fetch existing offer if property is negotiable
                        if (propertyRes.data.data.listingType === 'sell' && propertyRes.data.data.isNegotiable) {
                            try {
                                const offerRes = await api.get(`/offers/my-offer/${id}`);
                                if (offerRes.data.success && offerRes.data.data) {
                                    setExistingOffer(offerRes.data.data);
                                }
                            } catch (offerErr) {
                                console.log("No existing offer or failed to fetch");
                            }
                        }
                    }
                } catch (userErr) {
                    console.log("User not logged in or failed to fetch user state");
                }

            } catch (error) {
                console.error("Failed to fetch property details", error);
                toast.error("Could not load property details.");
            } finally {
                setLoading(false);
            }
        };
        fetchPropertyAndUser();
    }, [id]);

    if (loading) {
        return <div className="pd-loading">Loading property details...</div>;
    }

    if (!property) {
        return <div className="pd-error">Property not found.</div>;
    }

    const handleSaveToggle = async () => {
        try {
            if (!isSaved) {
                await api.put(`/users/save-property/${id}`);
                setIsSaved(true);
                toast.success("Property saved to your wishlist!");
            } else {
                await api.put(`/users/unsave-property/${id}`);
                setIsSaved(false);
                toast.info("Property removed from wishlist.");
            }
        } catch (error) {
            console.error("Failed to toggle save", error);
            toast.error("Please login to save properties.");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    }

    const handleCancelOffer = async () => {
        if (!existingOffer) return;
        if (!window.confirm("Are you sure you want to cancel your offer?")) return;
        try {
            const res = await api.delete(`/offers/${existingOffer._id}`);
            if (res.data.success) {
                toast.success("Offer cancelled successfully");
                setExistingOffer(null);
            }
        } catch (error) {
            console.error("Failed to cancel offer", error);
            toast.error(error.response?.data?.message || "Failed to cancel offer");
        }
    };

    const handleDeleteProperty = async () => {
        if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
            try {
                const res = await deleteProperty(property._id);
                if (res.data.success) {
                    toast.success("Property deleted successfully");
                    navigate("/my-properties?tab=listings");
                }
            } catch (error) {
                toast.error("Failed to delete property");
            }
        }
    };

    const formatPrice = (price) => {
        if (price >= 10000000) {
            return '₹' + (price / 10000000).toFixed(2) + ' Cr';
        } else if (price >= 100000) {
            return '₹' + (price / 100000).toFixed(2) + ' L';
        }
        return '₹' + price.toString();
    };

    const location = useLocation();
    // reads the data sent using navigate second parameter.
    const fromPath = location.state?.from || '/dashboard';

    let backText = "Back to Dashboard";
    if (fromPath.includes("tab=saved")) {
        backText = "Back to Saved Properties";
    } else if (fromPath.includes("tab=listings")) {
        backText = "Back to My Listings";
    } else if (fromPath.includes("/search")) {
        backText = "Back to Search Results";
    }

    return (
        <div className="property-detail-page">
            <nav className="pd-navbar">
                <Link to={fromPath} className="pd-back-btn">&larr; {backText}</Link>
                <div className="pd-nav-actions">
                    <button className="pd-icon-btn" onClick={handleShare} aria-label="Share">
                        <IconShare />
                    </button>
                    <button className={`pd-icon-btn ${isSaved ? 'saved' : ''}`} onClick={handleSaveToggle} aria-label="Save">
                        <IconHeart filled={isSaved} />
                    </button>
                </div>
            </nav>

            <div className="pd-gallery">
                {property.images && property.images.length > 0 ? (
                    <div className="pd-gallery-grid">
                        <img src={property.images[0]} alt="Main" className="pd-main-img" />
                        <div className="pd-side-imgs">
                            {property.images.slice(1, 3).map((img, idx) => (
                                <img key={idx} src={img} alt={`Side ${idx}`} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="pd-no-image">No Image Available</div>
                )}
            </div>

            <main className="pd-content">
                <div className="pd-main-col">
                    <div className="pd-header">
                        <div className="pd-tags">
                            <span className="pd-tag pd-tag-primary">{property.listingType.toUpperCase()}</span>
                            <span className="pd-tag">{property.propertyType}</span>
                            <span className="pd-tag pd-tag-status">{property.status}</span>
                            {property.isNegotiable && <span className="pd-tag pd-tag-nego">Negotiable</span>}
                        </div>
                        <h1 className="pd-title">{property.title}</h1>
                        <p className="pd-location"><IconMapPin /> {property.address.street ? property.address.street + ', ' : ''}{property.address.locality}, {property.address.city}</p>
                    </div>

                    <div className="pd-specs">
                        <div className="pd-spec-item">
                            <IconBed />
                            <div>
                                <strong>{property.specs.bedrooms || '-'}</strong>
                                <span>Beds</span>
                            </div>
                        </div>
                        <div className="pd-spec-item">
                            <IconBath />
                            <div>
                                <strong>{property.specs.bathrooms || '-'}</strong>
                                <span>Baths</span>
                            </div>
                        </div>
                        <div className="pd-spec-item">
                            <IconSquare />
                            <div>
                                <strong>{property.specs.areaSqft?.toFixed(2) || '-'}</strong>
                                <span>sq.ft</span>
                            </div>
                        </div>
                    </div>

                    <div className="pd-section">
                        <h2>Description</h2>
                        <p className="pd-description">{property.description}</p>
                    </div>

                    {property.project && (
                        <div className="pd-section">
                            <ProjectBanner project={property.project} builder={property.builder} />
                        </div>
                    )}

                    <div className="pd-section">
                        <h2>Location & Neighborhood</h2>
                        <LocationMap location={property.location} address={property.address} />
                    </div>

                    {property.salesHistory && property.salesHistory.length > 0 && (
                        <div className="pd-section">
                            <h2>Ownership History</h2>
                            <SalesHistoryTimeline history={property.salesHistory} />
                        </div>
                    )}
                </div>

                <aside className="pd-sidebar">
                    <div className="pd-card pd-pricing-card">
                        <div className="pd-price-row">
                            <span className="pd-price-amount">
                                {existingOffer?.status === 'Accepted' ? formatPrice(existingOffer.offerPrice) : formatPrice(property.totalPrice)}
                            </span>
                            {property.listingType === 'rent' && <span className="pd-price-period">/ month</span>}
                        </div>
                        
                        {existingOffer?.status === 'Accepted' && (
                            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                                <span style={{ background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Accepted Offer Price</span>
                            </div>
                        )}
                        
                        <AppreciationBadge history={property.salesHistory} currentPrice={existingOffer?.status === 'Accepted' ? existingOffer.offerPrice : property.totalPrice} />

                        {property.listingType === 'sell' && property.isNegotiable && property.status !== 'Sold' && (!currentUser || (property.ownerId && currentUser._id !== property.ownerId._id)) && (!existingOffer || existingOffer.status === 'Pending') && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="pd-btn-primary pd-offer-btn" onClick={() => setShowOfferModal(true)} style={{ flex: 1 }}>
                                    {existingOffer ? 'View/Edit Your Offer' : 'Make an Offer'}
                                </button>
                                {existingOffer && (
                                    <button className="pd-btn-primary pd-offer-btn" onClick={handleCancelOffer} style={{ flex: 1, background: '#ef4444' }}>
                                        Cancel Offer
                                    </button>
                                )}
                            </div>
                        )}

                        {currentUser && property.ownerId && currentUser._id !== property.ownerId._id && property.status !== 'Sold' && (property.listingType === 'sell' || property.listingType === 'rent') && (
                            <div style={{ marginTop: '12px' }}>
                                <button className="pd-btn-primary pd-offer-btn" onClick={() => setShowRequestModal(true)} style={{ width: '100%', background: property.isActiveTenant ? '#ef4444' : '#10b981' }}>
                                    {property.isActiveTenant 
                                        ? 'Submit Vacancy Request' 
                                        : (property.listingType === 'rent' 
                                            ? 'Request Tenancy' 
                                            : (existingOffer?.status === 'Accepted' ? 'Request Ownership Transfer at Accepted Price' : 'Request Ownership Transfer')
                                          )}
                                </button>
                            </div>
                        )}

                        {currentUser && property.ownerId && currentUser._id === property.ownerId._id && (
                            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                                <button className="pd-btn-primary pd-offer-btn" onClick={() => navigate(`/edit-property/${property._id}`)} style={{ flex: 1, background: '#4f46e5' }}>
                                    Edit Property
                                </button>
                                <button className="pd-btn-primary pd-offer-btn" onClick={handleDeleteProperty} style={{ flex: 1, background: '#ef4444' }}>
                                    Delete Property
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Owner Information</h4>
                            {property.ownerId ? (
                                <div style={{ fontSize: '0.95rem', color: '#4b5563' }}>
                                    <p style={{ margin: '4px 0' }}><strong>Name:</strong> {property.ownerId.name}</p>
                                    <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {property.ownerId.phoneNumber}</p>
                                    <p style={{ margin: '4px 0' }}><strong>Email:</strong> {property.ownerId.email}</p>
                                </div>
                            ) : (
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>Owner details not available.</p>
                            )}
                        </div>
                    </div>

                    <div className="pd-card pd-calc-card">
                        <FinancialCalculator property={property} formatPrice={formatPrice} />
                    </div>
                </aside>
            </main>

            {showOfferModal && (
                <OfferModal
                    property={property}
                    existingOffer={existingOffer}
                    onClose={() => setShowOfferModal(false)}
                    onOfferUpdated={(offer) => setExistingOffer(offer)}
                />
            )}
            
            {showRequestModal && (
                <PropertyRequestModal
                    property={property}
                    isVacancy={property.isActiveTenant}
                    onClose={() => setShowRequestModal(false)}
                />
            )}
        </div>
    );
}
