import { publicRequest } from "../requestMethods";

const validateAuth = (email, password) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
    }
    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }
};

export const login = async (email, password) => {
    try {
        validateAuth(email, password);
        const response = await publicRequest.post("/auth/login", { email, password });
        const { token, ...userData } = response.data;

        if (token) {
            const user = { ...userData, token };
            localStorage.setItem("user", JSON.stringify(user));
            publicRequest.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return user;
        }
        throw new Error("Invalid response from server");
    } catch (error) {
        const message = error.response?.data?.message || error.message || "Login failed";
        throw new Error(message);
    }
};

export const register = async (email, password) => {
    try {
        validateAuth(email, password);
        const response = await publicRequest.post("/auth/register", {
            email,
            password,
            createdAt: new Date().toISOString()
        });
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || "Registration failed";
        throw new Error(message);
    }
};

export const logout = () => {
    try {
        localStorage.removeItem("user");
        // Clear authorization header
        delete publicRequest.defaults.headers.common['Authorization'];
    } catch (error) {
        console.error("Logout error:", error);
    }
};

// New utility functions
export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
};

export const isAuthenticated = () => {
    const user = getCurrentUser();
    return !!user && !!user.token;
};

export const getAuthToken = () => {
    const user = getCurrentUser();
    return user?.token;
};

// Initialize auth header from storage
const user = getCurrentUser();
if (user?.token) {
    publicRequest.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
}
