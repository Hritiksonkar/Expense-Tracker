import React, { useState } from 'react';
import SharedAuthLayout from './SharedAuthLayout';
import { register } from '../services/authService';

const Register = ({ onToggleForm, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirm) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await register(formData.email, formData.password);
            if (onRegisterSuccess) onRegisterSuccess(res);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SharedAuthLayout title="Create account" subtitle="Join ExpenseTracker">
            {() => (
                <>
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }} id="auth-title">Create an account</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Start tracking your expenses</p>
                    </div>

                    {error && <div style={{ background: 'rgba(255,0,0,0.04)', color: '#ffb0b0', padding: 10, borderRadius: 8, marginBottom: 8 }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>
                        <input className="input" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        <input className="input" type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                        <input className="input" type="password" placeholder="Confirm password" value={formData.confirm} onChange={(e) => setFormData({ ...formData, confirm: e.target.value })} required />
                        <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 14, color: 'rgba(255,255,255,0.6)' }}>
                        Already have an account? <button onClick={onToggleForm} style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: 6 }}>Sign in</button>
                    </div>
                </>
            )}
        </SharedAuthLayout>
    );
};

export default Register;
