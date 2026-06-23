import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import AuthForm from './components/auth/AuthForm';
import Sidebar from './components/layout/Sidebar';
import BottomNavigation from './components/layout/BottomNavigation';
import Dashboard from './components/dashboard/Dashboard';
import TransactionForm from './components/transactions/TransactionForm';
import Reports from './components/reports/Reports';
import Settings from './components/settings/Settings';
import Modal from './components/ui/Modal';
import { Transaction } from './types';
import { Plus, Search, Bell, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';

function App() {
  const { user, loading: authLoading, login, register, logout, updateUserInState } = useAuth();
  const {
    transactions,
    loading: transactionsLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(user?.id || '');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    const result = await addTransaction({ ...transactionData, user_id: user.id });
    if (result.success) {
      setShowTransactionModal(false);
      setEditingTransaction(null);
    }
  };

  const handleEditTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingTransaction) return;
    const result = await updateTransaction(editingTransaction.id, transactionData);
    if (result.success) {
      setShowTransactionModal(false);
      setEditingTransaction(null);
    }
  };

  const openAddModal = () => { setEditingTransaction(null); setShowTransactionModal(true); };

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    reports: 'Reports',
    settings: 'Settings',
  };

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  // ── Loading screen ──────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#a78bfa' }} />
          <p style={{ color: '#c7d2fe', fontSize: '0.9rem', fontWeight: 500 }}>Loading ExpenseTrack...</p>
        </div>
      </div>
    );
  }

  // ── Auth screen ─────────────────────────────────────
  if (!user) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  // ── Transactions tab content ─────────────────────────
  const renderTransactions = () => {
    const filtered = transactions.filter(t =>
      !searchQuery ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="animate-fade-in-up">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>Transactions</h2>
            <p>{transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            Add Transaction
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            className="form-input"
            placeholder="Search by category or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '42px', borderRadius: '12px' }}
          />
        </div>

        <div className="card">
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Plus size={28} color="#94a3b8" />
              </div>
              <p style={{ color: '#64748b', fontWeight: 600 }}>
                {searchQuery ? 'No transactions match your search' : 'No transactions yet'}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '6px' }}>
                {searchQuery ? 'Try a different search term' : 'Add your first transaction to get started!'}
              </p>
            </div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="transaction-item">
                <div className={`transaction-icon ${t.type}`}>
                  {t.type === 'income'
                    ? <ArrowUpRight size={18} />
                    : <ArrowDownRight size={18} />}
                </div>
                <div style={{ flex: 1, marginLeft: '14px', minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{t.category}</p>
                  {t.description && <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>}
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}
                    <span style={{ textTransform: 'capitalize' }}>{t.payment_method.replace('_', ' ')}</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '12px', flexShrink: 0 }}>
                  <p style={{ fontWeight: 700, color: t.type === 'income' ? '#059669' : '#dc2626', fontSize: '0.95rem' }}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </p>
                  <span className={`badge badge-${t.type}`}>{t.type}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                  <button
                    onClick={() => { setEditingTransaction(t); setShowTransactionModal(true); }}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#6366f1', transition: 'all 150ms' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    style={{ padding: '6px', borderRadius: '8px', border: '1.5px solid #fee2e2', background: 'white', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', transition: 'all 150ms' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} onAddTransaction={openAddModal} />;
      case 'transactions':
        return renderTransactions();
      case 'reports':
        return <Reports transactions={transactions} />;
      case 'settings':
        return <Settings user={user} onUserUpdate={updateUserInState} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Header Bar */}
        <header className="main-header">
          <div className="main-header-title">{tabTitles[activeTab]}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeTab !== 'settings' && (
              <button
                className="btn btn-primary"
                onClick={openAddModal}
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                <Plus size={15} />
                Add Transaction
              </button>
            )}
            <button style={{ width: 36, height: 36, borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          {transactionsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <div className="spinner" />
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Transaction Modal */}
      <Modal
        isOpen={showTransactionModal}
        onClose={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
        title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        size="lg"
      >
        <TransactionForm
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          onCancel={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
          initialData={editingTransaction || undefined}
        />
      </Modal>
    </div>
  );
}

export default App;