import React, { useState } from 'react';

export default function SharedAuthLayout({ children, defaultPaletteIndex = 1, title = 'Welcome', subtitle = '' }) {
    // palettes
    const palettes = [
        { id: 'ocean', colors: ['#38bdf8', '#7c3aed'], label: 'Ocean → Violet' },
        { id: 'sunset', colors: ['#ff7a20', '#ffb86b'], label: 'Sunset' },
        { id: 'mint', colors: ['#34d399', '#06b6d4'], label: 'Mint → Aqua' },
        { id: 'rose', colors: ['#f472b6', '#fb7185'], label: 'Rose' },
    ];

    const [paletteIndex, setPaletteIndex] = useState(defaultPaletteIndex);
    const palette = palettes[paletteIndex];

    const cssVars = {
        '--accent': palette.colors[0],
        '--accent-2': palette.colors[1],
        '--card-glow': palette.colors[1] + '22'
    };

    return (
        <div className="page-shell" style={cssVars}>
            {/* scoped styles for background, blobs, palette swatches and card shell */}
            <style>{`
				.page-shell { min-height:100vh; display:flex; flex-direction:column; background: linear-gradient(90deg, #050407 0%, #071026 20%, #0b2346 100%); color:var(--text, #e6eef8); }
				.topbar { height:64px; display:flex; align-items:center; justify-content:space-between; padding:0 28px; }
				.brand { display:flex; align-items:center; gap:12px; color:var(--accent); font-weight:700; font-size:18px; }
				.brand .logo { width:36px; height:36px; border-radius:50%; background:linear-gradient(90deg,var(--accent),var(--accent-2)); display:inline-flex; align-items:center; justify-content:center; color:#041025; font-weight:700; box-shadow: 0 6px 18px rgba(0,0,0,0.5); }
				.login-bg { flex:1; display:flex; align-items:center; justify-content:center; padding:2rem; position:relative; overflow:hidden; }
				.bg-blob{ position:absolute; filter: blur(68px) saturate(120%); opacity:0.28; pointer-events:none; transform-origin:center; }
				.bg-blob.blob-1{ width:520px;height:520px; left:-8%; top:-6%; background: radial-gradient(circle at 30% 30%, rgba(124,58,237,0.85), rgba(124,58,237,0.25) 45%, transparent 65%); }
				.bg-blob.blob-2{ width:440px;height:440px; right:-6%; bottom:-8%; background: radial-gradient(circle at 70% 70%, rgba(56,189,248,0.72), rgba(56,189,248,0.22) 45%, transparent 65%); }
				.login-card { position:relative; z-index:10; width:100%; max-width:520px; border-radius:10px; padding:28px; background: rgba(8,12,20,0.7); border: 1px solid rgba(255,255,255,0.04); box-shadow: 0 18px 50px rgba(2,6,23,0.6); backdrop-filter: blur(8px); transition: transform 180ms ease; }
				.login-card:hover { transform: translateY(-6px); }
				.palette-wrap { position:absolute; right:12px; top:12px; display:flex; gap:8px; z-index:20; }
				.swatch { width:36px; height:36px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; box-shadow: 0 6px 18px rgba(2,6,23,0.35); transition: transform 140ms ease, box-shadow 140ms ease; }
				.swatch:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 18px 30px rgba(2,6,23,0.45); }
				.swatch.active { outline:2px solid rgba(255,255,255,0.08); transform: translateY(-4px) scale(1.05); }
				.swatch-inner { width:100%; height:100%; border-radius:6px; display:block; position:relative; overflow:hidden; }
				.palette-info { position:absolute; right:12px; top:56px; z-index:20; font-size:12px; color:var(--muted, rgba(255,255,255,0.6)); background: rgba(0,0,0,0.04); padding:6px 8px; border-radius:8px; backdrop-filter: blur(6px); }
				@media (max-width:640px){ .login-card { padding:18px; margin:0 12px; } .palette-info { display:none; } }
			`}</style>

            {/* optional topbar (kept minimal, forms can ignore) */}
            <div className="topbar" aria-hidden>
                <div className="brand"><span className="logo">E</span><span className="text">ExpenseTracker</span></div>
                <div className="top-actions" aria-hidden />
            </div>

            <div className="login-bg" role="main">
                <div className="bg-blob blob-1" aria-hidden="true"></div>
                <div className="bg-blob blob-2" aria-hidden="true"></div>

                {/* palette controls */}
                <div className="palette-wrap" aria-hidden={false}>
                    {palettes.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => setPaletteIndex(i)}
                            title={p.label}
                            aria-label={`Activate ${p.label}`}
                            className={`swatch ${i === paletteIndex ? 'active' : ''}`}
                            style={{ ['--sw1']: p.colors[0], ['--sw2']: p.colors[1] }}
                        >
                            <span className="swatch-inner" style={{ background: `linear-gradient(90deg, ${p.colors[0]}, ${p.colors[1]})` }} />
                        </button>
                    ))}
                </div>

                <div className="palette-info" aria-hidden={false}>
                    <span style={{ color: 'var(--muted, rgba(255,255,255,0.6))' }}>{palettes[paletteIndex].label}</span>
                </div>

                {/* card shell; children is a render-function to inject content */}
                <div className="login-card" role="region" aria-labelledby="auth-title" style={cssVars}>
                    {typeof children === 'function'
                        ? children({ palette: palettes[paletteIndex], setPaletteIndex, palettes, cssVars })
                        : children}
                </div>
            </div>
        </div>
    );
}
