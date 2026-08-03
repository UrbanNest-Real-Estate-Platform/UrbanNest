import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function OfferModal({ property, onClose }) {
    const [offerPrice, setOfferPrice] = useState(property.totalPrice);
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock API request
        toast.success(`Your offer of ₹${offerPrice} has been sent to the owner!`);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Make an Offer</h3>
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
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">Submit Offer</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
