import api from "./axios";

export const getLiveAuctions = async () => {
    return await api.get("/properties/auctions");
};

export const getFeaturedSaleProperties = async () => {
    return await api.get("/properties/featured-sale");
};

export const getRentalProperties = async () => {
    return await api.get("/properties/rentals");
};

export const getRecentlyViewed = async (propertyIds) => {
    return await api.post("/properties/recently-viewed", { propertyIds });
};

export const searchProperties = async (queryParams) => {
    const params = new URLSearchParams();
    if (queryParams.bhk) params.append("bhk", queryParams.bhk);
    if (queryParams.listing_type) params.append("listing_type", queryParams.listing_type);
    if (queryParams.price_range) params.append("price_range", queryParams.price_range);
    if (queryParams.locality) params.append("locality", queryParams.locality);
    if (queryParams.city) params.append("city", queryParams.city);
    if (queryParams.page) params.append("page", queryParams.page);
    if (queryParams.limit) params.append("limit", queryParams.limit);
    
    return await api.get(`/properties/search?${params.toString()}`);
};

export const getPropertyById = async (id) => {
    return await api.get(`/properties/${id}`);
};

export const createProperty = async (propertyData) => {
    return await api.post("/properties", propertyData);
};

export const updateProperty = async (id, propertyData) => {
    return await api.put(`/properties/${id}`, propertyData);
};

export const deleteProperty = async (id) => {
    return await api.delete(`/properties/${id}`);
};
