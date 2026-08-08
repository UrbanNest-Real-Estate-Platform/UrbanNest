import api from "./axios";

export const registerUser = (userData) => {
    return api.post("/auth/register", userData);
};

export const loginUser = (loginData) => {
    return api.post("/auth/login", loginData);
};

export const registerBuilder = (builderData) => {
    return api.post("/auth/builder/register", builderData);
};

export const loginBuilder = (loginData) => {
    return api.post("/auth/builder/login", loginData);
};

export const loginAdmin = (loginData) =>{
    return api.post("/auth/admin/login",loginData);
};

export const forgotPassword = (data) => {
    return api.post("/auth/forgot-password", data);
};

export const resetPassword = (token, data) => {
    return api.post(`/auth/reset-password/${token}`, data);
};

export const resetPasswordWithOtp = (data) => {
    return api.post("/auth/reset-password", data);
};
