import React, { useState } from 'react';
import { Calendar, DollarSign, Tag, CreditCard, FileText } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Transaction } from '../../types';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: Partial<Transaction>;
  loading?: boolean;
}

const categories = {
  expense: ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other']
};

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'other', label: 'Other' }
];

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'expense',
    amount: initialData?.amount || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    payment_method: initialData?.payment_method || 'cash',
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount.toString()) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      user_id: '', // This will be set by the parent component
      amount: parseFloat(formData.amount.toString()),
    } as Omit<Transaction, 'id' | 'created_at' | 'updated_at'>);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const availableCategories = categories[formData.type as keyof typeof categories];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.type === 'income'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-green-600">💰</div>
              <span className="font-medium">Income</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.type === 'expense'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-red-600">💸</div>
              <span className="font-medium">Expense</span>
            </div>
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (₹)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            className={`
              block w-full pl-10 pr-3 py-3 text-lg font-medium rounded-lg border
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.amount ? 'border-red-300' : 'border-gray-300'}
            `}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`
            block w-full px-3 py-2 rounded-lg border
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.category ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <option value="">Select a category</option>
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          icon={Calendar}
        />

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add a note about this transaction..."
          rows={3}
          className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {initialData ? 'Update' : 'Add'} Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;