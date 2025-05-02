import React, { useState } from 'react';
import { register } from '../services/authService';

const Register = ({ onToggleForm }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords don't match");
                return;
            }
            if (formData.password.length < 6) {
                setError("Password must be at least 6 characters long");
                return;
            }
            await register(formData.email, formData.password);
            onToggleForm(); // Switch back to login after successful registration
        } catch (err) {
            // Handle specific error messages
            if (err.message.includes('404')) {
                setError("Registration service is currently unavailable. Please try again later.");
            } else {
                setError(err.message || "Registration failed. Please try again.");
            }
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
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
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full p-2 border rounded"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button type="submit" className="w-full bg-[#af8978] text-white p-2 rounded">
                    Register
                </button>
            </form>
            <button
                onClick={onToggleForm}
                className="w-full mt-4 text-[#af8978]"
            >
                Have an account? Login
            </button>
        </div>
    );
};

export default Register;
