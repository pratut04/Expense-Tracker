import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import {
  getTransactionsApi,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
} from '../lib/api';

export const useTransactions = (userId: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await getTransactionsApi();
    if (error || !data) {
      console.error('Failed to fetch transactions:', error);
    } else {
      // Normalize _id → id
      const normalized = data.transactions.map((t: any) => ({
        ...t,
        id: t.id || t._id,
      }));
      setTransactions(normalized);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const { data, error } = await createTransactionApi(transactionData);
    if (error || !data) return { success: false, error };
    const newTx = { ...data.transaction, id: data.transaction.id || data.transaction._id };
    setTransactions(prev => [newTx, ...prev]);
    return { success: true, data: newTx };
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await updateTransactionApi(id, updates);
    if (error || !data) return { success: false, error };
    const updatedTx = { ...data.transaction, id: data.transaction.id || data.transaction._id };
    setTransactions(prev => prev.map(t => (t.id === id ? updatedTx : t)));
    return { success: true, data: updatedTx };
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await deleteTransactionApi(id);
    if (error) return { success: false, error };
    setTransactions(prev => prev.filter(t => t.id !== id));
    return { success: true };
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
};