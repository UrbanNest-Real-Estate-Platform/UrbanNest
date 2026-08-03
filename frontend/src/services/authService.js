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