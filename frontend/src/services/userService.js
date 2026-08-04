import api from "./axios";

export const getSavedProperties = () => {
    return api.get("/users/saved-properties");
};

export const getMyListings = () => {
    return api.get("/users/my-listings");
};
