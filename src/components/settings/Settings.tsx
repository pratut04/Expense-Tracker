import React, { useState, useEffect } from 'react';
import {
  User, Bell, Moon, Globe, Calendar, Lock, Trash2,
  Shield, Save, Eye, EyeOff, CheckCircle, AlertCircle, Palette
} from 'lucide-react';
import { getSettingsApi, updateSettingsApi, changePasswordApi } from '../../lib/api';
import type { AuthUser } from '../../hooks/useAuth';

interface SettingsProps {
  user: AuthUser;
  onUserUpdate: (updated: Partial<AuthUser>) => void;
}

const CURRENCIES = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'GBP', label: '£ British Pound (GBP)' },
  { value: 'JPY', label: '¥ Japanese Yen (JPY)' },
  { value: 'AED', label: 'د.إ UAE Dirham (AED)' },
];

const SettingsSection: React.FC<{ icon: React.ReactNode; title: string; description?: string; color: string; children: React.ReactNode }> = ({ icon, title, description, color, children }) => (
  <div className="settings-section">
    <div className="settings-section-header">
      <div className="settings-section-icon" style={{ background: color }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        {description && <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; id: string }> = ({ checked, onChange, id }) => (
  <label className="toggle" htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="toggle-slider" />
  </label>
);

const Toast: React.FC<{ msg: string; type: 'success' | 'error'; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="animate-scale-in"
      style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
        background: type === 'success' ? '#059669' : '#dc2626',
        color: 'white', padding: '14px 20px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 8px 24px rgb(0 0 0 / 0.2)',
        fontSize: '0.875rem', fontWeight: 500, maxWidth: '320px',
      }}
    >
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {msg}
    </div>
  );
};

const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
  const [name, setName] = useState(user.name || '');
  const [currency, setCurrency] = useState(user.settings?.currency || 'INR');
  const [monthStartDay, setMonthStartDay] = useState(user.settings?.month_start_day || 1);
  const [notifications, setNotifications] = useState(user.settings?.notifications_enabled ?? true);
  const [darkMode, setDarkMode] = useState(user.settings?.dark_mode ?? false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Load from server
  useEffect(() => {
    getSettingsApi().then(({ data }) => {
      if (data) {
        setName(data.name || '');
        setCurrency(data.settings?.currency || 'INR');
        setMonthStartDay(data.settings?.month_start_day || 1);
        setNotifications(data.settings?.notifications_enabled ?? true);
        setDarkMode(data.settings?.dark_mode ?? false);
      }
    });
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

  const handleSaveProfile = async () => {
    setSaving(true);
    const { data, error } = await updateSettingsApi({
      name,
      currency,
      month_start_day: monthStartDay,
      notifications_enabled: notifications,
      dark_mode: darkMode,
    });
    setSaving(false);

    if (error || !data) {
      showToast(error || 'Failed to save settings', 'error');
    } else {
      showToast('Settings saved successfully!', 'success');
      onUserUpdate({ name: data.name, settings: data.settings });
    }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd) return showToast('Please fill all password fields.', 'error');
    if (newPwd !== confirmPwd) return showToast('New passwords do not match.', 'error');
    if (newPwd.length < 6) return showToast('Password must be at least 6 characters.', 'error');

    setChangingPwd(true);
    const { error } = await changePasswordApi(currentPwd, newPwd);
    setChangingPwd(false);

    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Password changed successfully!', 'success');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    }
  };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '720px' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage your profile and app preferences</p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 700, color: 'white',
          boxShadow: '0 8px 20px rgb(99 102 241 / 0.3)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{user.name || 'User'}</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{user.email}</p>
          <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 10px', background: '#ede9fe', color: '#7c3aed', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
            Active Account
          </span>
        </div>
      </div>

      {/* Profile Settings */}
      <SettingsSection
        icon={<User size={18} color="#6366f1" />}
        title="Profile Information"
        description="Update your name and account details"
        color="linear-gradient(135deg, #e0e7ff, #ede9fe)"
      >
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="form-label">Display Name</label>
          <input
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="form-label">Email Address</label>
          <input className="form-input" value={user.email} disabled style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Email cannot be changed</p>
        </div>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection
        icon={<Palette size={18} color="#8b5cf6" />}
        title="Preferences"
        description="Customize your app experience"
        color="linear-gradient(135deg, #ede9fe, #fae8ff)"
      >
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="form-label">Currency</label>
          <select className="form-input" value={currency} onChange={e => setCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="form-label">Month Starts On Day</label>
          <select className="form-input" value={monthStartDay} onChange={e => setMonthStartDay(Number(e.target.value))} style={{ maxWidth: '200px' }}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'}</option>
            ))}
          </select>
        </div>
        <div className="settings-row">
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Push Notifications</p>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Get alerts for budget limits and reminders</p>
          </div>
          <Toggle checked={notifications} onChange={setNotifications} id="notifications" />
        </div>
        <div className="settings-row">
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Dark Mode</p>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Switch to dark theme (coming soon)</p>
          </div>
          <Toggle checked={darkMode} onChange={setDarkMode} id="dark_mode" />
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn btn-primary"
          onClick={handleSaveProfile}
          disabled={saving}
          style={{ width: '100%', padding: '13px', fontSize: '0.9rem', borderRadius: '12px', opacity: saving ? 0.7 : 1 }}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Security */}
      <SettingsSection
        icon={<Shield size={18} color="#10b981" />}
        title="Security"
        description="Change your password to keep your account safe"
        color="linear-gradient(135deg, #dcfce7, #d1fae5)"
      >
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="form-label">Current Password</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              className="form-input"
              type={showPwd ? 'text' : 'password'}
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder="Enter current password"
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="form-label">New Password</label>
          <input className="form-input" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Minimum 6 characters" />
        </div>
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="form-label">Confirm New Password</label>
          <input className="form-input" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repeat new password" />
        </div>
        <div className="settings-row">
          <button
            className="btn btn-primary"
            onClick={handleChangePassword}
            disabled={changingPwd}
            style={{ opacity: changingPwd ? 0.7 : 1 }}
          >
            <Lock size={15} />
            {changingPwd ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="settings-section" style={{ border: '1.5px solid #fee2e2' }}>
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
            <Trash2 size={18} color="#dc2626" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626' }}>Danger Zone</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Irreversible actions — proceed with caution</p>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Delete Account</p>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Permanently delete your account and all data</p>
          </div>
          <button
            className="btn btn-danger"
            onClick={() => showToast('Please contact support to delete your account.', 'error')}
            style={{ flexShrink: 0 }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
