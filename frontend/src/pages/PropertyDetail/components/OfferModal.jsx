import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../services/axios';

export default function OfferModal({ property, existingOffer, onClose, onOfferUpdated }) {
    const [offerPrice, setOfferPrice] = useState(existingOffer ? existingOffer.offerPrice : property.totalPrice);
    const [message, setMessage] = useState(existingOffer && existingOffer.message ? existingOffer.message : '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let res;
            if (existingOffer) {
                res = await api.put(`/offers/${existingOffer._id}`, {
                    offerPrice,
                    message
                });
            } else {
                res = await api.post('/offers', {
                    propertyId: property._id,
                    offerPrice,
                    message
                });
            }
            if (res.data.success) {
                toast.success(existingOffer ? 'Your offer has been updated!' : `Your offer of ₹${offerPrice} has been sent to the owner!`);
                if (onOfferUpdated) onOfferUpdated(res.data.data);
                onClose();
            }
        } catch (error) {
            console.error("Failed to submit offer", error);
            toast.error(error.response?.data?.message || "Failed to submit offer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>{existingOffer ? 'Edit Your Offer' : 'Make an Offer'}</h3>
                <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '0.9rem' }}>
                    The asking price is <strong>₹{property.totalPrice.toLocaleString('en-IN')}</strong>, but the seller is open to negotiation.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Offer Price (₹)</label>
                        <input
                            type="number"
                            required
                            min={property.totalPrice * 0.5}
                            value={offerPrice}
                            onChange={e => setOfferPrice(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Message to Seller (Optional)</label>
                        <textarea
                            rows="4"
                            placeholder="e.g. I am a pre-approved buyer willing to close quickly..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : (existingOffer ? 'Update Offer' : 'Submit Offer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
