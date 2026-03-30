import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0fdfa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  container: { width: '100%', maxWidth: '420px' },
  logoSection: { textAlign: 'center', marginBottom: '32px' },
  logoIcon: {
    width: '64px', height: '64px',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '32px', margin: '0 auto 16px',
    boxShadow: '0 8px 25px rgba(5,150,105,0.35)',
  },
  logoTitle: { fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: '0 0 6px 0' },
  logoSub: { color: '#64748b', fontSize: '14px', margin: 0 },
  card: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    border: '1px solid #f1f5f9',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    padding: '24px',
    textAlign: 'center',
  },
  cardHeaderTitle: { color: 'white', fontWeight: '800', fontSize: '20px', margin: '0 0 4px 0' },
  cardHeaderSub: { color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 },
  cardBody: { padding: '28px' },
  errorBox: {
    background: '#fff1f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
  },
  inputWrap: { marginBottom: '20px' },
  input: {
    width: '100%',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '15px',
    color: '#1e293b',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(5,150,105,0.4)',
    transition: 'all 0.3s',
    marginBottom: '20px',
    fontFamily: 'inherit',
  },
  linkRow: { textAlign: 'center', color: '#64748b', fontSize: '14px' },
  link: { color: '#059669', fontWeight: '700', textDecoration: 'none' },
  emergencyBox: {
    background: '#fff1f2',
    border: '1px solid #fca5a5',
    borderRadius: '14px',
    padding: '12px 16px',
    textAlign: 'center',
    marginTop: '16px',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '11px',
    marginTop: '16px',
  },
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.logoSection}>
          <div style={S.logoIcon}>🏥</div>
          <h1 style={S.logoTitle}>Health<span style={{ color: '#059669' }}>Mitra</span></h1>
          <p style={S.logoSub}>AI-Powered Rural Health Assistant</p>
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}>
            <p style={S.cardHeaderTitle}>Welcome Back 👋</p>
            <p style={S.cardHeaderSub}>Login to access your health dashboard</p>
          </div>

          <div style={S.cardBody}>
            {error && (
              <div style={S.errorBox}>⚠️ {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={S.inputWrap}>
                <label style={S.label}>📧 Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={S.input}
                  placeholder="Enter your email"
                  required
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={S.inputWrap}>
                <label style={S.label}>🔒 Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={S.input}
                  placeholder="Enter your password"
                  required
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '⏳ Logging in...' : '🚀 Login to Dashboard'}
              </button>
            </form>

            <div style={S.linkRow}>
              Don't have an account?{' '}
              <Link to="/register" style={S.link}>Create Account</Link>
            </div>
          </div>
        </div>

        <div style={S.emergencyBox}>
          🚨 Medical Emergency? Call <strong>108</strong>
        </div>
        <p style={S.disclaimer}>⚠️ Not for medical diagnosis. Always consult a doctor.</p>
      </div>
    </div>
  );
}

export default Login;