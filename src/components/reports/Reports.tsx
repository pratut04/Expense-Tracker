import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, PieChart as PieIcon,
  Calendar, ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react';
import { Transaction } from '../../types';

interface ReportsProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Transportation: '#3b82f6',
  Shopping: '#a855f7',
  Bills: '#ef4444',
  Entertainment: '#ec4899',
  Health: '#14b8a6',
  Education: '#8b5cf6',
  Other: '#94a3b8',
  Salary: '#10b981',
  Freelance: '#06b6d4',
  Business: '#f59e0b',
  Investment: '#6366f1',
  Gift: '#e11d48',
};

const getColor = (cat: string) => CATEGORY_COLORS[cat] || '#6366f1';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const barCanvasRef = useRef<HTMLCanvasElement>(null);
  const donutCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('6m');

  const { monthlyData, categoryData, summary } = useMemo(() => {
    const now = new Date();
    const months = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;

    // Build monthly buckets
    const monthlyMap: Record<string, { income: number; expense: number; label: string }> = {};
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthlyMap[key] = { income: 0, expense: 0, label };
    }

    // Category totals for expenses
    const catMap: Record<string, number> = {};
    let totalIncome = 0, totalExpense = 0;
    let maxIncome = 0, maxExpense = 0;

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        if (t.type === 'income') monthlyMap[key].income += t.amount;
        else monthlyMap[key].expense += t.amount;
      }
      if (t.type === 'income') totalIncome += t.amount;
      else {
        totalExpense += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    });

    const monthlyData = Object.values(monthlyMap);
    monthlyData.forEach(m => {
      maxIncome = Math.max(maxIncome, m.income);
      maxExpense = Math.max(maxExpense, m.expense);
    });

    const categoryData = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percent: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        color: getColor(name),
      }));

    return {
      monthlyData,
      categoryData,
      summary: { totalIncome, totalExpense, balance: totalIncome - totalExpense, savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0 },
      maxBar: Math.max(maxIncome, maxExpense),
    };
  }, [transactions, selectedPeriod]);

  // Draw bar chart
  useEffect(() => {
    const canvas = barCanvasRef.current;
    if (!canvas || monthlyData.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const pad = { top: 20, right: 20, bottom: 50, left: 60 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const allVals = monthlyData.flatMap(m => [m.income, m.expense]);
    const maxVal = Math.max(...allVals, 1);

    const barGroupW = chartW / monthlyData.length;
    const barW = Math.min((barGroupW - 12) / 2, 28);

    // Grid lines
    const gridCount = 5;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridCount; i++) {
      const y = pad.top + (chartH / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();

      // Y labels
      const val = maxVal - (maxVal / gridCount) * i;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val.toFixed(0)}`, pad.left - 8, y + 4);
    }

    // Bars
    monthlyData.forEach((month, i) => {
      const x = pad.left + barGroupW * i + barGroupW / 2;
      const incomeH = (month.income / maxVal) * chartH;
      const expenseH = (month.expense / maxVal) * chartH;

      // Income bar
      const incGrad = ctx.createLinearGradient(0, pad.top + chartH - incomeH, 0, pad.top + chartH);
      incGrad.addColorStop(0, '#10b981');
      incGrad.addColorStop(1, '#34d399');
      ctx.fillStyle = incGrad;
      const rx = 4;
      const ix = x - barW - 3;
      const iy = pad.top + chartH - incomeH;
      ctx.beginPath();
      ctx.roundRect(ix, iy, barW, incomeH, [rx, rx, 0, 0]);
      ctx.fill();

      // Expense bar
      const expGrad = ctx.createLinearGradient(0, pad.top + chartH - expenseH, 0, pad.top + chartH);
      expGrad.addColorStop(0, '#ef4444');
      expGrad.addColorStop(1, '#f87171');
      ctx.fillStyle = expGrad;
      const ex = x + 3;
      const ey = pad.top + chartH - expenseH;
      ctx.beginPath();
      ctx.roundRect(ex, ey, barW, expenseH, [rx, rx, 0, 0]);
      ctx.fill();

      // Month label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(month.label, x, pad.top + chartH + 18);
    });

    // Legend
    ctx.fillStyle = '#10b981';
    ctx.fillRect(pad.left, h - 16, 10, 10);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Income', pad.left + 14, h - 7);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(pad.left + 80, h - 16, 10, 10);
    ctx.fillStyle = '#64748b';
    ctx.fillText('Expenses', pad.left + 94, h - 7);
  }, [monthlyData]);

  // Draw donut chart
  useEffect(() => {
    const canvas = donutCanvasRef.current;
    if (!canvas || categoryData.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 16;
    const innerR = outerR * 0.58;

    let startAngle = -Math.PI / 2;
    const total = categoryData.reduce((s, c) => s + c.amount, 0);

    categoryData.forEach((cat) => {
      const slice = (cat.amount / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = cat.color;
      ctx.fill();
      startAngle += slice;
    });

    // Center hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Total', cx, cy - 6);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px Inter, sans-serif';
    const totalStr = total >= 100000 ? `₹${(total / 100000).toFixed(1)}L` : total >= 1000 ? `₹${(total / 1000).toFixed(0)}K` : `₹${total}`;
    ctx.fillText(totalStr, cx, cy + 12);
  }, [categoryData]);

  const periodOptions: Array<{ value: '3m' | '6m' | '12m'; label: string }> = [
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '12m', label: '12 Months' },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Financial Reports</h2>
          <p>Analyze your spending patterns and trends</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {periodOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedPeriod(opt.value)}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: '1.5px solid',
                borderColor: selectedPeriod === opt.value ? 'rgb(99 102 241)' : '#e2e8f0',
                background: selectedPeriod === opt.value ? 'rgb(99 102 241)' : 'white',
                color: selectedPeriod === opt.value ? 'white' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card stat-card-income" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '4px', fontWeight: 500 }}>Total Income</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{formatINR(summary.totalIncome)}</p>
          </div>
          <ArrowUpRight size={32} style={{ opacity: 0.5, position: 'relative', zIndex: 1 }} />
        </div>
        <div className="stat-card stat-card-expense" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '4px', fontWeight: 500 }}>Total Expenses</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{formatINR(summary.totalExpense)}</p>
          </div>
          <ArrowDownRight size={32} style={{ opacity: 0.5, position: 'relative', zIndex: 1 }} />
        </div>
        <div className="stat-card stat-card-balance" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '4px', fontWeight: 500 }}>Net Savings</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{formatINR(summary.balance)}</p>
          </div>
          <TrendingUp size={32} style={{ opacity: 0.5, position: 'relative', zIndex: 1 }} />
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={22} color="#7c3aed" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>Savings Rate</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: summary.savingsRate >= 0 ? '#059669' : '#dc2626', letterSpacing: '-0.03em' }}>
              {summary.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {/* Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={18} color="#6366f1" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Income vs Expenses</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Monthly comparison</p>
            </div>
          </div>
          {transactions.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
              No data yet — add some transactions!
            </div>
          ) : (
            <div style={{ position: 'relative', height: '260px' }}>
              <canvas ref={barCanvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
          )}
        </div>

        {/* Donut Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieIcon size={18} color="#ec4899" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Expense Breakdown</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>By category</p>
            </div>
          </div>
          {categoryData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
              No expenses yet
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '180px', margin: '0 auto' }}>
              <canvas ref={donutCanvasRef} style={{ width: '100%', aspectRatio: '1' }} />
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={18} color="#059669" />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Top Spending Categories</h3>
        </div>
        {categoryData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            No expense data available for this period.
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {categoryData.slice(0, 8).map((cat, i) => (
              <div key={cat.name} className="donut-legend-item" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, width: '20px', textAlign: 'right' }}>#{i + 1}</span>
                <div className="donut-legend-dot" style={{ background: cat.color }} />
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{cat.name}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{formatINR(cat.amount)}</span>
                  <div style={{ width: '80px', height: '4px', borderRadius: '999px', background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: `${cat.percent}%`, height: '100%', borderRadius: '999px', background: cat.color, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, minWidth: '36px', textAlign: 'right' }}>
                  {cat.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
