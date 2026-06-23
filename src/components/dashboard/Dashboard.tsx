import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus,
  ArrowUpRight,
  ArrowDownRight 
} from 'lucide-react';
import { Transaction } from '../../types';
import Button from '../ui/Button';

interface DashboardProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onAddTransaction }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const monthlyTransactions = transactions.filter(t => 
      new Date(t.date) >= startOfMonth
    );
    const dailyTransactions = transactions.filter(t => 
      new Date(t.date) >= startOfDay
    );

    const calculateTotals = (txns: Transaction[]) => {
      return txns.reduce(
        (acc, transaction) => {
          if (transaction.type === 'income') {
            acc.income += transaction.amount;
          } else {
            acc.expense += transaction.amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      );
    };

    const monthly = calculateTotals(monthlyTransactions);
    const daily = calculateTotals(dailyTransactions);

    return {
      monthly: {
        ...monthly,
        balance: monthly.income - monthly.expense,
      },
      daily: {
        ...daily,
        balance: daily.income - daily.expense,
      },
    };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Monthly Balance</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.monthly.balance)}</p>
          <p className="text-sm opacity-80 mt-1">
            {stats.monthly.balance >= 0 ? '↗' : '↘'} vs last month
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Monthly Income</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.monthly.income)}</p>
          <p className="text-sm opacity-80 mt-1">
            +{((stats.monthly.income / Math.max(stats.monthly.expense, 1)) * 100).toFixed(1)}% vs expenses
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Monthly Expenses</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.monthly.expense)}</p>
          <p className="text-sm opacity-80 mt-1">
            {stats.monthly.expense > 0 ? '↗' : '→'} spending trend
          </p>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <ArrowUpRight className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-sm text-green-700 font-medium">Income</span>
            </div>
            <p className="text-xl font-bold text-green-800">
              {formatCurrency(stats.daily.income)}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <ArrowDownRight className="w-5 h-5 text-red-600 mr-1" />
              <span className="text-sm text-red-700 font-medium">Expenses</span>
            </div>
            <p className="text-xl font-bold text-red-800">
              {formatCurrency(stats.daily.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={onAddTransaction}
          icon={Plus}
          className="flex-1 sm:flex-none"
        >
          Add Transaction
        </Button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                      }
                    `}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.category}</p>
                      <p className="text-sm text-gray-500">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Start by adding your first transaction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;