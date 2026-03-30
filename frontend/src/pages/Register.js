import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0fdfa)',
    padding: '32px 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  container: { width: '100%', maxWidth: '580px', margin: '0 auto' },
  logoSection: { textAlign: 'center', marginBottom: '28px' },
  logoIcon: {
    width: '56px', height: '56px',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', margin: '0 auto 12px',
    boxShadow: '0 8px 25px rgba(5,150,105,0.35)',
  },
  logoTitle: { fontSize: '26px', fontWeight: '900', color: '#1e293b', margin: '0 0 4px 0' },
  logoSub: { color: '#64748b', fontSize: '14px', margin: 0 },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  stepActive: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    borderRadius: '12px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
  },
  stepInactive: {
    flex: 1,
    padding: '10px',
    background: '#f1f5f9',
    color: '#94a3b8',
    borderRadius: '12px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '14px',
  },
  stepDivider: {
    width: '32px',
    height: '2px',
    background: '#e2e8f0',
    flexShrink: 0,
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #f1f5f9',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    padding: '20px 24px',
    textAlign: 'center',
  },
  cardHeaderTitle: { color: 'white', fontWeight: '800', fontSize: '18px', margin: 0 },
  cardBody: { padding: '28px' },
  errorBox: {
    background: '#fff1f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    marginBottom: '20px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  inputWrap: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#1e293b',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#1e293b',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
    background: 'white',
    cursor: 'pointer',
  },
  btnRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  backBtn: {
    flex: 1,
    background: '#f1f5f9',
    color: '#374151',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  nextBtn: {
    flex: 2,
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(5,150,105,0.35)',
    fontFamily: 'inherit',
  },
  linkRow: { textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '20px' },
  link: { color: '#059669', fontWeight: '700', textDecoration: 'none' },
  disclaimer: { textAlign: 'center', color: '#94a3b8', fontSize: '11px', marginTop: '16px' },
};

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', phone: '',
    age: '', gender: 'male', village: '', district: '',
    state: '', preferred_language: 'english',
    known_diseases: '', allergies: '', emergency_contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (!formData.full_name || !formData.email || !formData.password || !formData.phone || !formData.age) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const submitData = {
        ...formData,
        age: parseInt(formData.age),
        known_diseases: formData.known_diseases ? formData.known_diseases.split(',').map(s => s.trim()).filter(Boolean) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        current_medicines: [],
        pregnancy_status: false
      };
      const res = await authAPI.register(submitData);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: res.data.user_id,
        full_name: formData.full_name,
        email: formData.email,
        preferred_language: formData.preferred_language
      }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputFocus = (e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; };
  const inputBlur = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.logoSection}>
          <div style={S.logoIcon}>🏥</div>
          <h1 style={S.logoTitle}>Join Health<span style={{ color: '#059669' }}>Mitra</span></h1>
          <p style={S.logoSub}>Create your free health account</p>
        </div>

        {/* Progress */}
        <div style={S.progressRow}>
          <div style={step === 1 ? S.stepActive : S.stepInactive}>1 · Basic Info</div>
          <div style={S.stepDivider}></div>
          <div style={step === 2 ? S.stepActive : S.stepInactive}>2 · Health Info</div>
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}>
            <p style={S.cardHeaderTitle}>
              {step === 1 ? '👤 Personal Details' : '🏥 Health Information'}
            </p>
          </div>

          <div style={S.cardBody}>
            {error && <div style={S.errorBox}>⚠️ {error}</div>}

            {step === 1 ? (
              <div>
                <div style={S.grid2}>
                  <div style={S.inputWrap}>
                    <label style={S.label}>Full Name *</label>
                    <input name="full_name" value={formData.full_name} onChange={handleChange}
                      style={S.input} placeholder="Your full name" onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div style={S.inputWrap}>
                    <label style={S.label}>Phone *</label>
                    <input name="phone" value={formData.phone} onChange={handleChange}
                      style={S.input} placeholder="10-digit mobile" onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </div>

                <div style={S.inputWrap}>
                  <label style={S.label}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    style={S.input} placeholder="your@email.com" onFocus={inputFocus} onBlur={inputBlur} />
                </div>

                <div style={S.inputWrap}>
                  <label style={S.label}>Password * (min 6 chars)</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    style={S.input} placeholder="Create a strong password" onFocus={inputFocus} onBlur={inputBlur} />
                </div>

                <div style={S.grid2}>
                  <div style={S.inputWrap}>
                    <label style={S.label}>Age *</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange}
                      style={S.input} placeholder="Age" min="1" max="120" onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div style={S.inputWrap}>
                    <label style={S.label}>Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} style={S.select}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleNext} style={S.nextBtn}>
                  Next: Health Info →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={S.grid2}>
                  <div style={S.inputWrap}>
                    <label style={S.label}>Village / City</label>
                    <input name="village" value={formData.village} onChange={handleChange}
                      style={S.input} placeholder="Your village/city" onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div style={S.inputWrap}>
                    <label style={S.label}>District</label>
                    <input name="district" value={formData.district} onChange={handleChange}
                      style={S.input} placeholder="District" onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div style={S.inputWrap}>
                    <label style={S.label}>State</label>
                    <input name="state" value={formData.state} onChange={handleChange}
                      style={S.input} placeholder="State" onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div style={S.inputWrap}>
                    <label style={S.label}>Preferred Language</label>
                    <select name="preferred_language" value={formData.preferred_language} onChange={handleChange} style={S.select}>
                      {['english', 'hindi', 'gujarati', 'tamil', 'marathi'].map(l => (
                        <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={S.inputWrap}>
                  <label style={S.label}>Known Diseases (comma separated)</label>
                  <input name="known_diseases" value={formData.known_diseases} onChange={handleChange}
                    style={S.input} placeholder="e.g., diabetes, hypertension" onFocus={inputFocus} onBlur={inputBlur} />
                </div>

                <div style={S.inputWrap}>
                  <label style={S.label}>Allergies (comma separated)</label>
                  <input name="allergies" value={formData.allergies} onChange={handleChange}
                    style={S.input} placeholder="e.g., penicillin, dust" onFocus={inputFocus} onBlur={inputBlur} />
                </div>

                <div style={S.inputWrap}>
                  <label style={S.label}>Emergency Contact Number</label>
                  <input name="emergency_contact" value={formData.emergency_contact} onChange={handleChange}
                    style={S.input} placeholder="Emergency phone number" onFocus={inputFocus} onBlur={inputBlur} />
                </div>

                <div style={S.btnRow}>
                  <button type="button" onClick={() => setStep(1)} style={S.backBtn}>← Back</button>
                  <button type="submit" disabled={loading} style={{ ...S.nextBtn, opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
                  </button>
                </div>
              </form>
            )}

            <div style={S.linkRow}>
              Already have an account?{' '}
              <Link to="/login" style={S.link}>Login here</Link>
            </div>
          </div>
        </div>
        <p style={S.disclaimer}>⚠️ Not for medical diagnosis. Always consult a doctor.</p>
      </div>
    </div>
  );
}

export default Register;