import api from './axios';

// Get offers for a property (Owner only)
export const getPropertyOffers = (propertyId) => {
    return api.get(`/offers/property/${propertyId}`);
};

// Respond to an offer (Accept/Reject)
export const respondToOffer = (offerId, status) => {
    return api.put(`/offers/${offerId}/respond`, { status });
};
