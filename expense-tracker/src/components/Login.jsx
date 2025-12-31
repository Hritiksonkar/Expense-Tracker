import React, { useState } from 'react';
import { login, resetPassword } from '../services/authService';
import SharedAuthLayout from './SharedAuthLayout';

const Login = ({ onToggleForm, onLoginSuccess }) => {
    const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [resetData, setResetData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);

    const inputStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#fff'
    };

    const handleLoginSubmit = async (e) => {
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

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.email) {
            setError("Please enter your email");
            return;
        }

        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            setGeneratedLink(`http://localhost:5173/reset-password/${token}`);
            setSuccessMessage("Check your email for the reset link");
        }, 1000);
    };

    const handleResetLinkClick = (e) => {
        e.preventDefault();
        setView('reset');
        setGeneratedLink(null);
        setSuccessMessage('');
        setError('');
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (resetData.newPassword !== resetData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            // Call the actual backend API to reset password
            await resetPassword(formData.email, resetData.newPassword);

            setSuccessMessage("Password reset successfully! You can now login.");
            setTimeout(() => {
                setView('login');
                setSuccessMessage('');
                // Clear sensitive fields
                setFormData(prev => ({ ...prev, password: '' }));
                setResetData({ newPassword: '', confirmPassword: '' });
            }, 3000);
        } catch (err) {
            setError(err.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const saved = localStorage.getItem('rememberEmail');
        if (saved) setFormData((s) => ({ ...s, email: saved }));
    }, []);

    const renderHeader = (title, subtitle) => (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h2 id="auth-title" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                {title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>{subtitle}</p>
        </div>
    );

    return (
        <SharedAuthLayout title="Welcome back" subtitle="Log in to access your expenses">
            {() => (
                <>
                    {view === 'login' && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: 8 }}>
                                <h2 id="auth-title" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                                    Welcome to <span style={{ color: 'var(--accent)' }}>ExpenseTracker</span>
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Log in to access your expenses</p>
                            </div>

                            {error && <div style={{ background: 'rgba(255,0,0,0.04)', color: '#ff4d4f', padding: 10, borderRadius: 8, marginBottom: 8 }}>{error}</div>}
                            {successMessage && <div style={{ background: 'rgba(0,255,0,0.04)', color: '#52c41a', padding: 10, borderRadius: 8, marginBottom: 8 }}>{successMessage}</div>}

                            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>
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
                                    <button
                                        type="button"
                                        style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                                        onClick={() => { setView('forgot'); setError(''); setSuccessMessage(''); }}
                                    >
                                        Forgot?
                                    </button>
                                </div>

                                <button type="submit" className="primary-btn" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Login'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: 14, color: 'rgba(255,255,255,0.6)' }}>
                                New here? <button onClick={onToggleForm} style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer' }}>Create an account</button>
                            </div>
                        </>
                    )}

                    {view === 'forgot' && (
                        <>
                            {renderHeader('Forgot Password', 'Enter your email to receive a password reset link')}

                            {generatedLink && (
                                <div style={{ marginTop: 10, padding: 10, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50', borderRadius: 8 }}>
                                    <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: 5, fontSize: '0.9em' }}>
                                        🔧 Development Mode - Click the link below:
                                    </div>
                                    <a href="#" onClick={handleResetLinkClick} style={{ color: '#64b5f6', textDecoration: 'underline', wordBreak: 'break-all', fontSize: '0.9em' }}>
                                        {generatedLink}
                                    </a>
                                </div>
                            )}

                            {/* Development mode hint */}
                            {formData.email && !generatedLink && (
                                <div style={{ color: '#4caf50', fontSize: '0.9em', marginTop: 10, marginBottom: 5 }}>
                                    Development mode: Check the response for reset link
                                </div>
                            )}

                            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }} noValidate>
                                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Email</label>
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

                                <button type="submit" className="primary-btn" style={{ background: '#f97316', marginTop: 10 }} disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: 14 }}>
                                <button
                                    type="button"
                                    onClick={() => { setView('login'); setError(''); setSuccessMessage(''); setGeneratedLink(null); }}
                                    style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </>
                    )}

                    {view === 'reset' && (
                        <>
                            {renderHeader('Reset Password', 'Create a new password for your account')}

                            {error && <div style={{ background: 'rgba(255,0,0,0.04)', color: '#ff4d4f', padding: 10, borderRadius: 8, marginBottom: 8 }}>{error}</div>}
                            {successMessage && <div style={{ background: 'rgba(0,255,0,0.04)', color: '#52c41a', padding: 10, borderRadius: 8, marginBottom: 8 }}>{successMessage}</div>}

                            {!successMessage && (
                                <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }} noValidate>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="input"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="New Password"
                                            value={resetData.newPassword}
                                            onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="input"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Confirm Password"
                                            value={resetData.confirmPassword}
                                            onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="checkbox"
                                            onChange={() => setShowPassword(s => !s)}
                                            checked={showPassword}
                                            id="show-pass-reset"
                                        />
                                        <label htmlFor="show-pass-reset" style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Show Password</label>
                                    </div>

                                    <button type="submit" className="primary-btn" style={{ background: '#f97316', marginTop: 10 }} disabled={loading}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            )}

                            {successMessage && (
                                <div style={{ textAlign: 'center', marginTop: 10 }}>
                                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Redirecting to login...</p>
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginTop: 14 }}>
                                <button
                                    type="button"
                                    onClick={() => { setView('login'); setError(''); setSuccessMessage(''); }}
                                    style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </SharedAuthLayout>
    );
};

export default Login;
