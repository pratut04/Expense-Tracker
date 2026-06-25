import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Zap, Eye, EyeOff, Wallet } from 'lucide-react';
import { getDemoAccountsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface AuthFormProps {
  onSuccess: () => void;
}

interface DemoAccount {
  name: string;
  email: string;
  password: string;
  description: string;
  avatar: string;
  color: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    getDemoAccountsApi().then(({ data }) => {
      if (data) setDemoAccounts(data.accounts);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      if (!formData.name) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      result = await register(formData.name, formData.email, formData.password);
    }

    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Something went wrong');
    } else {
      onSuccess();
    }
  };

  const fillDemo = (account: DemoAccount) => {
    setFormData(prev => ({ ...prev, email: account.email, password: account.password }));
    setIsLogin(true);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-scale-in">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '20px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgb(99 102 241 / 0.4)',
          }}>
            <Wallet size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            {isLogin ? 'Welcome back!' : 'Create account'}
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem' }}>
            {isLogin ? 'Sign in to manage your finances' : 'Start tracking your expenses today'}
          </p>
        </div>

        {/* Demo Accounts */}
        {isLogin && demoAccounts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={13} color="#f59e0b" />
              Try a demo account
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {demoAccounts.map(account => (
                <button
                  key={account.email}
                  type="button"
                  className="demo-card"
                  onClick={() => fillDemo(account)}
                >
                  <div className="demo-avatar" style={{ background: account.color }}>
                    {account.avatar}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3730a3' }}>{account.name}</p>
                    <p style={{ fontSize: '0.7rem', color: '#6d28d9' }}>{account.description}</p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>Click to fill credentials</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {isLogin && demoAccounts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>or sign in manually</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  className="form-input"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="form-input"
                type="email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
                style={{ paddingLeft: '38px', paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.875rem', color: '#dc2626', lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px',
              background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 200ms',
              boxShadow: loading ? 'none' : '0 4px 14px rgb(99 102 241 / 0.4)',
              marginTop: '4px',
            }}
          >
            {loading ? '⏳ Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: '0.875rem', fontWeight: 600 }}
          >
            {isLogin ? "Don't have an account? Sign up →" : '← Already have an account? Sign in'}
          </button>
        </div>

        {/* Backend notice */}
        <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            🔒 Secured with JWT · 🗄️ MongoDB Atlas · Real data storage
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;