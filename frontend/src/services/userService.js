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
