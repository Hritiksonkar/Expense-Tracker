import React, { useState } from 'react';
import { login } from '../services/authService';

const Login = ({ onToggleForm, onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            const user = await login(formData.email, formData.password);
            onLoginSuccess(user);
        } catch (err) {
            // Handle specific error messages
            if (err.message.includes('404')) {
                setError("Login service is currently unavailable. Please try again later.");
            } else {
                setError(err.message || "Login failed. Please try again.");
            }
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="submit" className="w-full bg-[#af8978] text-white p-2 rounded">
                    Login
                </button>
            </form>
            <button
                onClick={onToggleForm}
                className="w-full mt-4 text-[#af8978]"
            >
                Need an account? Register
            </button>
        </div>
    );
};

export default Login;
