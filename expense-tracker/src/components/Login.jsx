import React, { useState } from 'react';
import { login } from '../services/authService';
import SharedAuthLayout from './SharedAuthLayout';

const Login = ({ onToggleForm, onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const inputStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#fff'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            if (remember) localStorage.setItem('rememberEmail', formData.email);
            onLoginSuccess(user);
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Login failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const saved = localStorage.getItem('rememberEmail');
        if (saved) setFormData((s) => ({ ...s, email: saved }));
    }, []);

    return (
        <SharedAuthLayout title="Welcome back" subtitle="Log in to access your expenses">
            {() => (
                <>
                    {/* header */}
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
                        <h2 id="auth-title" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                            Welcome to <span style={{ color: 'var(--accent)' }}>ExpenseTracker</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Log in to access your expenses</p>
                    </div>

                    {error && <div style={{ background: 'rgba(255,0,0,0.04)', color: '', padding: 10, borderRadius: 8, marginBottom: 8 }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>
                        <input
                            className="input"
                            type="email"
                            placeholder="name@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            autoFocus
                            style={inputStyle}
                        />

                        <div style={{ position: 'relative' }}>
                            <input
                                className="input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="********"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                style={inputStyle}
                            />
                            <div
                                className="input-icon"
                                onClick={() => setShowPassword((s) => !s)}
                                title={showPassword ? 'Hide password' : 'Show password'}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Remember me</span>
                            </label>
                            <button type="button" style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.7)' }} onClick={() => { /* forgot */ }}>
                                Forgot?
                            </button>
                        </div>

                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Login'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 14, color: 'rgba(255,255,255,0.6)' }}>
                        New here? <button onClick={onToggleForm} style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: 6 }}>Create an account</button>
                    </div>
                </>
            )}
        </SharedAuthLayout>
    );
};

export default Login;
