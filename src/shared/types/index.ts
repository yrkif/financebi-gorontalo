export interface User {
  id: string;
  email: string;
  name: string;
  monthly_income: number;
  monthly_expenses: number;
  total_savings: number;
  total_investments: number;
  emergency_fund: number;
  risk_profile: RiskProfileType;
  created_at: string;
}

export type RiskProfileType =
  | 'conservative_saver'
  | 'balanced_investor'
  | 'growth_seeker'
  | 'aggressive_trader';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description?: string;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
}

export interface Category {
  name: string;
  icon: any; // Lucide React icon component
  color: string;
  type: 'income' | 'expense';
}

export interface RiskProfile {
  type: string;
  description: string;
  characteristics: string[];
  recommendation: string;
  color: string;
  icon: string;
}

export interface RiskQuestion {
  title: string;
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

export interface FinancialStatus {
  cashFlow: {
    status: string;
    color: string;
    icon: string;
    message: string;
  };
  savings: {
    type: string;
    badge: string;
    description: string;
  };
  investment: {
    level: string;
    rank: string;
    insight: string;
  };
  scores: {
    cashflow: number;
    emergency: number;
    savings: number;
    investment: number;
  };
  overallScore: number;
  emergencyMonths: number;
}

export interface SmartInsight {
  type: 'urgent' | 'warning' | 'opportunity';
  title: string;
  message: string;
  action: string;
  icon: any;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  darkMode: boolean;
  showBalance: boolean;
  currentPage: string;
}
