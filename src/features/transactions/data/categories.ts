import {
  Briefcase,
  Trophy,
  TrendingUp,
  Utensils,
  Car,
  Home,
  ShoppingCart,
  Gamepad2,
  Heart,
  Book,
  Phone,
  Gift,
} from 'lucide-react';
import type { Category } from '@/types';

export const categories: Record<string, Category> = {
  // Income categories
  gaji: {
    name: 'Gaji',
    icon: Briefcase,
    color: 'text-green-600',
    type: 'income',
  },
  bonus: {
    name: 'Bonus',
    icon: Trophy,
    color: 'text-green-500',
    type: 'income',
  },
  investasi: {
    name: 'Hasil Investasi',
    icon: TrendingUp,
    color: 'text-green-400',
    type: 'income',
  },

  // Expense categories
  makanan: {
    name: 'Makanan & Minuman',
    icon: Utensils,
    color: 'text-red-500',
    type: 'expense',
  },
  transportasi: {
    name: 'Transportasi',
    icon: Car,
    color: 'text-blue-500',
    type: 'expense',
  },
  rumah: {
    name: 'Rumah & Utilities',
    icon: Home,
    color: 'text-purple-500',
    type: 'expense',
  },
  belanja: {
    name: 'Belanja',
    icon: ShoppingCart,
    color: 'text-pink-500',
    type: 'expense',
  },
  hiburan: {
    name: 'Hiburan',
    icon: Gamepad2,
    color: 'text-orange-500',
    type: 'expense',
  },
  kesehatan: {
    name: 'Kesehatan',
    icon: Heart,
    color: 'text-red-400',
    type: 'expense',
  },
  pendidikan: {
    name: 'Pendidikan',
    icon: Book,
    color: 'text-indigo-500',
    type: 'expense',
  },
  komunikasi: {
    name: 'Komunikasi',
    icon: Phone,
    color: 'text-gray-500',
    type: 'expense',
  },
  hadiah: {
    name: 'Hadiah & Donasi',
    icon: Gift,
    color: 'text-yellow-500',
    type: 'expense',
  },
};

export const getIncomeCategories = () =>
  Object.entries(categories).filter(([_, cat]) => cat.type === 'income');

export const getExpenseCategories = () =>
  Object.entries(categories).filter(([_, cat]) => cat.type === 'expense');

export const getCategoryById = (id: string) => categories[id];

export default categories;
