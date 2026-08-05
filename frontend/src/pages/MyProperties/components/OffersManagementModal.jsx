import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPropertyOffers, respondToOffer } from '../../../services/offerService';
import './OffersManagementModal.css';

export default function OffersManagementModal({ propertyId, onClose, onOfferStatusChange }) {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await getPropertyOffers(propertyId);
                if (res.data.success) {
                    setOffers(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch offers", error);
                toast.error("Could not load offers");
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, [propertyId]);

    const handleRespond = async (offerId, status) => {
        try {
            const res = await respondToOffer(offerId, status);
            if (res.data.success) {
                toast.success(`Offer ${status} successfully`);
                // Update local state
                setOffers(prev => prev.map(o => {
                    if (o._id === offerId) {
                        return { ...o, status };
                    } else if (status === 'Accepted' && o.status !== 'Rejected') {
                        return { ...o, status: 'Rejected' };
                    }
                    return o;
                }));
                if (onOfferStatusChange) {
                    onOfferStatusChange(propertyId);
                }
            }
        } catch (error) {
            console.error(`Failed to ${status} offer`, error);
            toast.error(error.response?.data?.message || `Failed to ${status} offer`);
        }
    };

    return (
        <div className="offers-modal-overlay">
            <div className="offers-modal-content">
                <div className="offers-modal-header">
                    <h2>Manage Offers</h2>
                    <button className="offers-modal-close" onClick={onClose}>&times;</button>
                </div>
                
                <div className="offers-modal-body">
                    {loading ? (
                        <p>Loading offers...</p>
                    ) : offers.length === 0 ? (
                        <p className="no-offers">No offers received for this property yet.</p>
                    ) : (
                        <div className="offers-list">
                            {offers.map(offer => (
                                <div key={offer._id} className={`offer-item ${offer.status.toLowerCase()}`}>
                                    <div className="offer-item-header">
                                        <div className="bidder-info">
                                            <strong>{offer.buyerId.name}</strong>
                                            <span>{offer.buyerId.email}</span>
                                        </div>
                                        <div className="offer-price">
                                            ₹{offer.offerPrice.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    
                                    {offer.message && (
                                        <div className="offer-message">
                                            "{offer.message}"
                                        </div>
                                    )}

                                    <div className="offer-meta">
                                        <span className="offer-date">{new Date(offer.createdAt).toLocaleDateString()}</span>
                                        <span className={`offer-status-badge ${offer.status.toLowerCase()}`}>
                                            {offer.status}
                                        </span>
                                    </div>

                                    {offer.status === 'Pending' && (
                                        <div className="offer-actions">
                                            <button 
                                                className="btn-accept" 
                                                onClick={() => handleRespond(offer._id, 'Accepted')}
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                className="btn-reject" 
                                                onClick={() => handleRespond(offer._id, 'Rejected')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
