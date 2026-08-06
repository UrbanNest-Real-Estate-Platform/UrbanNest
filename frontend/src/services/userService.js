import api from "./axios";

export const getSavedProperties = () => {
    return api.get("/users/saved-properties");
};

export const getMyListings = () => {
    return api.get("/users/my-listings");
};

export const getMyRents = () => {
    return api.get("/users/my-rents");
};

export const getPendingRequests = () => {
    return api.get("/users/pending-requests");
};

export const updateProfile = (data) => {
    return api.put("/users/profile", data);
};

export const markRecentlyViewed = (propertyId) => {
    return api.post(`/users/recently-viewed/${propertyId}`);
};

export const getRecentlyViewed = () => {
    return api.get("/users/recently-viewed");
};
