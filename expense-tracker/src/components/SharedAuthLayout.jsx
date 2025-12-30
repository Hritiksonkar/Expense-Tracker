export default function SharedAuthLayout({ children}) {
    const gradientWrapperStyle = {
        minHeight: '100vh',
        width: '100%',
        padding: '32px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(83,151,255,0.35), transparent 45%),' +
            'linear-gradient(135deg, #030b24 0%, #0d223f 45%, #120835 100%)'
    };

    const cardStyle = {
        width: '100%',
        maxWidth: 420,
        borderRadius: 24,
        padding: 32,
        background: 'rgba(8,12,30,0.6)',
        backdropFilter: 'blur(10px)'
    };

    return (
        <div style={gradientWrapperStyle}>
            <div style={cardStyle}>
                {/* optional topbar (kept minimal, forms can ignore) */}
                <div className="topbar" aria-hidden>
                    <div className="brand"><span  className="text">ExpenseTracker</span></div>
                    <div className="top-actions" aria-hidden />
                </div>

                <div className="login-bg" role="main">
                    <div className="bg-blob blob-1" aria-hidden="true"></div>
                    <div className="bg-blob blob-2" aria-hidden="true"></div>

                    {/* card shell; children is a render-function to inject content */}
                    <div className="login-card" role="region" aria-labelledby="auth-title">
                        {typeof children === 'function' ? children() : children}
                    </div>
                </div>
            </div>
        </div>
    );
}
