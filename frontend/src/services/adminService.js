import api from "./axios";

export const getDashboardStats = () => {
    return api.get("/admin/dashboard");
};

export const getPendingBuilders = () => {
    return api.get("/admin/builders/pending");
};

export const verifyBuilder = (id) => {
    return api.put(`/admin/builders/${id}/verify`);
};

export const getAllUsers = () => {
    return api.get("/admin/users");
};

export const getAllBuilders = () => {
    return api.get("/admin/builders");
};

export const deleteUser = (id) => {
    return api.delete(`/admin/users/${id}`);
};

export const rejectBuilder = (id) => {
    return api.put(`/admin/builders/${id}/reject`);
};

export const deleteBuilder = (id) => {
    return api.delete(`/admin/builders/${id}`);
};