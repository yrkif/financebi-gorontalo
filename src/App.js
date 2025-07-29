import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Target, User, Settings, BarChart3, PieChart, AlertCircle, CheckCircle, Trophy, Star, Zap, Heart, Briefcase, Home, CreditCard, ShoppingCart, Car, Utensils, Coffee, Gift, Phone, Book, Gamepad2, Plus, Eye, EyeOff, Calendar, Filter, Download, Upload, Bell, Shield, Sun, Moon } from 'lucide-react';

// Supabase configuration
const supabaseUrl = 'https://oknqqivsbxqiwutbtba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbmfxaXZzYnhxaXd1dGJ0YmEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTMzNzYyNCwiZXhwIjoyMDUwOTEzNjI0fQ.Kj3MFZSI3jn1Z';
const supabase = createClient(supabaseUrl, supabaseKey);

const FinanceApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [goals, setGoals] = useState([]);
  const [userData, setUserData] = useState(null);

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  // Risk assessment state
  const [riskAssessmentStep, setRiskAssessmentStep] = useState(1);
  const [riskAnswers, setRiskAnswers] = useState({});
  const [riskProfile, setRiskProfile] = useState(null);

  // Transaction form
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    type: 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Categories with Indonesian labels
  const categories = {
    // Income categories
    gaji: { name: 'Gaji', icon: Briefcase, color: 'text-green-600', type: 'income' },
    bonus: { name: 'Bonus', icon: Trophy, color: 'text-green-500', type: 'income' },
    investasi: { name: 'Hasil Investasi', icon: TrendingUp, color: 'text-green-400', type: 'income' },
    
    // Expense categories
    makanan: { name: 'Makanan & Minuman', icon: Utensils, color: 'text-red-500', type: 'expense' },
    transportasi: { name: 'Transportasi', icon: Car, color: 'text-blue-500', type: 'expense' },
    rumah: { name: 'Rumah & Utilities', icon: Home, color: 'text-purple-500', type: 'expense' },
    belanja: { name: 'Belanja', icon: ShoppingCart, color: 'text-pink-500', type: 'expense' },
    hiburan: { name: 'Hiburan', icon: Gamepad2, color: 'text-orange-500', type: 'expense' },
    kesehatan: { name: 'Kesehatan', icon: Heart, color: 'text-red-400', type: 'expense' },
    pendidikan: { name: 'Pendidikan', icon: Book, color: 'text-indigo-500', type: 'expense' },
    komunikasi: { name: 'Komunikasi', icon: Phone, color: 'text-gray-500', type: 'expense' },
    hadiah: { name: 'Hadiah & Donasi', icon: Gift, color: 'text-yellow-500', type: 'expense' }
  };

  // Risk Assessment Questions
  const riskQuestions = {
    1: {
      title: "Kepribadian Finansial Anda",
      question: "Ketika merencanakan liburan akhir pekan, Anda lebih suka:",
      options: [
        { text: "Itinerary detail dari pagi sampai malam", score: 1 },
        { text: "Rencana umum, sisanya spontan", score: 3 },
        { text: "Berangkat tanpa rencana, ikuti mood", score: 5 }
      ]
    },
    2: {
      title: "Skenario Investasi Realistis",
      question: "Anda punya bonus Rp 10 juta. Teman menawarkan bisnis yang bisa untung 100% dalam 6 bulan, tapi bisa rugi total. Reaksi pertama:",
      options: [
        { text: "Terlalu berisiko, lebih baik deposito saja", score: 1 },
        { text: "Menarik, tapi perlu riset mendalam dulu", score: 3 },
        { text: "Peluang bagus! Siap ambil risiko", score: 5 }
      ]
    },
    3: {
      title: "Simulasi Pasar Keuangan",
      question: "Investasi Anda turun 20% dalam sebulan karena kondisi pasar. Yang Anda lakukan:",
      options: [
        { text: "Jual segera sebelum rugi lebih besar", score: 1 },
        { text: "Tahan, analisis penyebab turunnya", score: 3 },
        { text: "Beli lebih banyak, harga lagi murah", score: 5 }
      ]
    },
    4: {
      title: "Gaya Hidup & Preferensi",
      question: "Proyek weekend ideal Anda:",
      options: [
        { text: "Mengatur ulang laporan keuangan keluarga", score: 1 },
        { text: "Belajar skill baru dari YouTube", score: 3 },
        { text: "Coba olahraga ekstrem yang belum pernah", score: 5 }
      ]
    },
    5: {
      title: "Pemikiran Jangka Panjang",
      question: "Definisi 'investasi jangka panjang' menurut Anda:",
      options: [
        { text: "5-10 tahun, fokus preservasi modal", score: 1 },
        { text: "10-20 tahun, balance growth dan safety", score: 3 },
        { text: "20+ tahun, maksimalkan potensi return", score: 5 }
      ]
    }
  };

  // Auth functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      
      // Get user data
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginData.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (userProfile) {
        setUserData(userProfile);
        setCurrentUser(data.user);
        setCurrentPage('dashboard');
      } else {
        // New user, start risk assessment
        setCurrentUser(data.user);
        setCurrentPage('risk-assessment');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      
      alert('Registrasi berhasil! Silakan cek email untuk verifikasi.');
      setIsRegistering(false);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load user data
  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (transactionsData) setTransactions(transactionsData);

      // Load budgets
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', currentUser.id);

      if (budgetsData) {
        const budgetsObj = {};
        budgetsData.forEach(budget => {
          budgetsObj[budget.category] = budget.amount;
        });
        setBudgets(budgetsObj);
      }

      // Load goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', currentUser.id);

      if (goalsData) setGoals(goalsData);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (currentUser && currentPage === 'dashboard') {
      loadUserData();
    }
  }, [currentUser, currentPage]);

  // Calculate Financial Status
  const getFinancialStatus = () => {
    if (!userData) return { overallScore: 0, cashFlow: {}, savings: {}, investment: {}, emergencyMonths: 0 };

    const cashFlowRatio = userData.monthly_income / userData.monthly_expenses;
    const savingsRate = userData.monthly_savings / userData.monthly_income || 0.2;
    const emergencyMonths = userData.emergency_fund / userData.monthly_expenses;
    const investmentRatio = userData.total_investments / (userData.monthly_income * 12);

    // Cash Flow Status
    let cashFlowStatus = {};
    if (cashFlowRatio >= 1.5) {
      cashFlowStatus = { status: "Excellent", color: "text-green-600", icon: "💚", message: "Cash flow sangat sehat! Surplus besar untuk investasi." };
    } else if (cashFlowRatio >= 1.2) {
      cashFlowStatus = { status: "Good", color: "text-blue-600", icon: "💙", message: "Cash flow positif dengan margin aman." };
    } else if (cashFlowRatio >= 1.0) {
      cashFlowStatus = { status: "Balanced", color: "text-yellow-600", icon: "💛", message: "Impas - perlu optimasi pengeluaran." };
    } else {
      cashFlowStatus = { status: "Critical", color: "text-red-600", icon: "❤️", message: "Defisit bulanan - tindakan segera diperlukan!" };
    }

    // Savings Profile
    let savingsProfile = {};
    if (savingsRate >= 0.3) {
      savingsProfile = { type: "Super Saver", badge: "🏆", description: "Penabung konsisten dengan rasio tinggi" };
    } else if (savingsRate >= 0.2) {
      savingsProfile = { type: "Steady Saver", badge: "⭐", description: "Penabung teratur dengan disiplin baik" };
    } else if (savingsRate >= 0.1) {
      savingsProfile = { type: "Beginner Saver", badge: "🌱", description: "Mulai membangun kebiasaan menabung" };
    } else {
      savingsProfile = { type: "Struggling Saver", badge: "⚠️", description: "Perlu bangun fondasi saving habit" };
    }

    // Investment Maturity
    let investmentMaturity = {};
    if (userData.total_investments > userData.monthly_income * 12 && investmentRatio >= 0.5) {
      investmentMaturity = { level: "Advanced Investor", rank: "💎", insight: "Investor matang dengan strategi komprehensif." };
    } else if (userData.total_investments > userData.monthly_income * 6) {
      investmentMaturity = { level: "Growing Investor", rank: "🚀", insight: "Sedang membangun wealth dengan progres baik." };
    } else if (userData.total_investments > 0) {
      investmentMaturity = { level: "Beginner Investor", rank: "🌟", insight: "Sudah mulai investasi - ini langkah besar!" };
    } else {
      investmentMaturity = { level: "Pre-Investor", rank: "💡", insight: "Siap naik level dari saving ke investing." };
    }

    // Overall Score
    const scores = {
      cashflow: Math.min(100, (cashFlowRatio - 1) * 100),
      emergency: Math.min(100, (emergencyMonths / 6) * 100),
      savings: Math.min(100, savingsRate * 500),
      investment: Math.min(100, investmentRatio * 200)
    };
    
    const overallScore = Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / 4);

    return {
      cashFlow: cashFlowStatus,
      savings: savingsProfile,
      investment: investmentMaturity,
      scores,
      overallScore,
      emergencyMonths: Math.round(emergencyMonths * 10) / 10
    };
  };

  const financialStatus = getFinancialStatus();

  // Smart Financial Insights
  const getSmartInsights = () => {
    if (!userData) return [];
    
    const insights = [];
    const status = financialStatus;

    if (status.emergencyMonths < 6) {
      insights.push({
        type: "urgent",
        title: "Dana Darurat Belum Optimal",
        message: `Dana darurat Anda baru ${status.emergencyMonths} bulan pengeluaran. Target minimal 6 bulan. Prioritaskan menabung Rp ${Math.round((userData.monthly_expenses * 6 - userData.emergency_fund) / 12).toLocaleString()}/bulan.`,
        action: "Buat auto-debit khusus dana darurat",
        icon: Shield
      });
    }

    if (userData.monthly_expenses > userData.monthly_income * 0.8) {
      insights.push({
        type: "warning",
        title: "Rasio Pengeluaran Tinggi",
        message: `Pengeluaran ${Math.round((userData.monthly_expenses / userData.monthly_income) * 100)}% dari income. Idealnya maksimal 70% untuk financial flexibility.`,
        action: "Review 3 kategori pengeluaran terbesar",
        icon: AlertCircle
      });
    }

    if (userData.total_investments < userData.monthly_income * 6 && userData.risk_profile !== 'conservative_saver') {
      insights.push({
        type: "opportunity",
        title: "Peluang Investasi Sesuai Profil",
        message: `Sebagai '${userData.risk_profile?.replace('_', ' ')}', Anda bisa investasi lebih optimal. Pertimbangkan menambah investasi bulanan.`,
        action: "Jelajahi reksa dana sesuai profil risiko",
        icon: TrendingUp
      });
    }

    return insights;
  };

  // Login Component
  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FinanceBI</h1>
          <p className="text-gray-600 mt-2">Personal Finance Management</p>
          <p className="text-sm text-blue-600 font-medium">Bank Indonesia Gorontalo</p>
        </div>
        
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="nama@bi-gorontalo.go.id"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : (isRegistering ? 'Daftar' : 'Masuk')}
          </button>
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {isRegistering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </form>
      </div>
    </div>
  );

  // Risk Assessment Component
  const RiskAssessment = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [showResults, setShowResults] = useState(false);

    const handleAnswer = (questionId, answer) => {
      setRiskAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const nextStep = () => {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        calculateRiskProfile();
      }
    };

    const calculateRiskProfile = () => {
      const totalScore = Object.values(riskAnswers).reduce((sum, answer) => sum + answer.score, 0);
      let profile = {};
      
      if (totalScore <= 8) {
        profile = {
          type: "Conservative Saver",
          description: "Pengaman Dana - Prioritas Keamanan",
          characteristics: ["Mengutamakan keamanan modal", "Tidak suka volatilitas", "Fokus pada produk guaranteed return"],
          recommendation: "Deposito, obligasi pemerintah, reksa dana pasar uang",
          color: "text-green-600",
          icon: "🛡️"
        };
      } else if (totalScore <= 15) {
        profile = {
          type: "Balanced Investor", 
          description: "Penyeimbang Bijak - Moderat & Stabil",
          characteristics: ["Seimbang antara return dan risiko", "Bisa terima fluktuasi terbatas", "Investasi jangka menengah"],
          recommendation: "Reksa dana campuran, obligasi korporat, SBN",
          color: "text-blue-600",
          icon: "⚖️"
        };
      } else if (totalScore <= 20) {
        profile = {
          type: "Growth Seeker",
          description: "Pemburu Pertumbuhan - Optimis & Aktif", 
          characteristics: ["Target return tinggi", "Bisa tahan volatile jangka pendek", "Investasi jangka panjang"],
          recommendation: "Reksa dana saham, ETF, saham blue chip",
          color: "text-purple-600",
          icon: "📈"
        };
      } else {
        profile = {
          type: "Aggressive Trader",
          description: "Petarung Pasar - Berani & Dinamis",
          characteristics: ["Sangat aggressive untuk return maksimal", "Nyaman dengan high volatility", "Active trading"],
          recommendation: "Saham growth, cryptocurrency, commodities",
          color: "text-red-600", 
          icon: "🚀"
        };
      }

      setRiskProfile(profile);
      setShowResults(true);
    };

    const finishAssessment = async () => {
      try {
        // Create user profile
        const { error } = await supabase
          .from('users')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.user_metadata?.name || 'User',
            monthly_income: 8500000,
            monthly_expenses: 6200000,
            total_savings: 45000000,
            total_investments: 25000000,
            emergency_fund: 24000000,
            risk_profile: riskProfile.type.toLowerCase().replace(' ', '_')
          });

        if (error) throw error;

        // Load user data
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        setUserData(userProfile);
        setCurrentPage('dashboard');
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile: ' + error.message);
      }
    };

    if (showResults) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{riskProfile.icon}</div>
              <h2 className="text-3xl font-bold text-gray-900">{riskProfile.type}</h2>
              <p className={`text-xl ${riskProfile.color} font-semibold mt-2`}>{riskProfile.description}</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Karakteristik Anda:</h3>
                <ul className="space-y-2">
                  {riskProfile.characteristics.map((char, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rekomendasi Investasi:</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{riskProfile.recommendation}</p>
              </div>

              <button 
                onClick={finishAssessment}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Mulai Kelola Keuangan Saya
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentQuestion = riskQuestions[currentStep];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-indigo-600">Langkah {currentStep} dari 5</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 5) * 100)}% selesai</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentQuestion.title}</h2>
            <p className="text-lg text-gray-700">{currentQuestion.question}</p>
          </div>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  handleAnswer(currentStep, option);
                  setTimeout(nextStep, 300);
                }}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-4 group-hover:border-indigo-500"></div>
                  <span className="text-gray-700 group-hover:text-indigo-700">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Main Dashboard
  const Dashboard = () => {
    const insights = getSmartInsights();

    return (
      <div className="space-y-6">
        {/* Financial Health Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Halo, {userData?.name || 'User'}! 👋</h2>
              <p className="text-blue-100">Selamat datang di dashboard keuangan Anda</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{financialStatus.overallScore}/100</div>
              <div className="text-blue-100">Skor Kesehatan</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl mb-1">{financialStatus.cashFlow.icon}</div>
              <div className="text-sm text-blue-100">Cash Flow</div>
              <div className="font-semibold">{financialStatus.cashFlow.status}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl mb-1">{financialStatus.savings.badge}</div>
              <div className="text-sm text-blue-100">Saving Profile</div>
              <div className="font-semibold">{financialStatus.savings.type}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl mb-1">{financialStatus.investment.rank}</div>
              <div className="text-sm text-blue-100">Investment</div>
              <div className="font-semibold">{financialStatus.investment.level}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-sm text-blue-100">Emergency Fund</div>
              <div className="font-semibold">{financialStatus.emergencyMonths} bulan</div>
            </div>
          </div>
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="h-6 w-6 text-yellow-500 mr-2" />
              Insight Pintar Untuk Anda
            </h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className={`border-l-4 pl-4 py-3 rounded-r-lg bg-gray-50 ${
                  insight.type === 'urgent' ? 'border-red-500' : 
                  insight.type === 'warning' ? 'border-yellow-500' : 'border-green-500'
                }`}>
                  <div className="flex items-start">
                    <insight.icon className={`h-5 w-5 mr-3 mt-0.5 ${
                      insight.type === 'urgent' ? 'text-red-500' : 
                      insight.type === 'warning' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <p className="text-gray-700 text-sm mt-1">{insight.message}</p>
                      <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-700">
                        {insight.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <button onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? <Eye className="h-5 w-5 text-gray-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {showBalance ? `Rp ${userData?.monthly_income?.toLocaleString() || '0'}` : '••••••••'}
            </div>
            <div className="text-gray-600 text-sm">Pendapatan Bulanan</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {showBalance ? `Rp ${userData?.monthly_expenses?.toLocaleString() || '0'}` : '••••••••'}
            </div>
            <div className="text-gray-600 text-sm">Pengeluaran Bulanan</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {showBalance ? `Rp ${userData?.total_savings?.toLocaleString() || '0'}` : '••••••••'}
            </div>
            <div className="text-gray-600 text-sm">Total Tabungan</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {showBalance ? `Rp ${userData?.total_investments?.toLocaleString() || '0'}` : '••••••••'}
            </div>
            <div className="text-gray-600 text-sm">Total Investasi</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setCurrentPage('add-transaction')}
              className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <PlusCircle className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-600">Tambah Transaksi</span>
            </button>
            <button 
              onClick={() => setCurrentPage('budget')}
              className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <Target className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-600">Atur Budget</span>
            </button>
            <button 
              onClick={() => setCurrentPage('goals')}
              className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <Trophy className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-600">Target Keuangan</span>
            </button>
            <button 
              onClick={() => setCurrentPage('reports')}
              className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-600">Laporan</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Transaction Component
  const AddTransaction = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: currentUser.id,
            amount: parseFloat(newTransaction.amount),
            category: newTransaction.category,
            type: newTransaction.type,
            description: newTransaction.description,
            date: newTransaction.date
          });

        if (error) throw error;

        alert('Transaksi berhasil ditambahkan!');
        setNewTransaction({
          amount: '',
          category: '',
          type: 'expense',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        loadUserData();
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    const expenseCategories = Object.entries(categories).filter(([_, cat]) => cat.type === 'expense');
    const incomeCategories = Object.entries(categories).filter(([_, cat]) => cat.type === 'income');
    const currentCategories = newTransaction.type === 'expense' ? expenseCategories : incomeCategories;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tambah Transaksi</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Jenis Transaksi</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense', category: '' }))}
                  className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                    newTransaction.type === 'expense' 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingDown className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Pengeluaran</div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income', category: '' }))}
                  className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                    newTransaction.type === 'income' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Pemasukan</div>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Kategori</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentCategories.map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewTransaction(prev => ({ ...prev, category: key }))}
                      className={`p-4 rounded-xl border-2 transition-colors text-left ${
                        newTransaction.category === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${category.color} mb-2`} />
                      <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan (Opsional)</label>
              <input
                type="text"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Makan siang di kantin"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!newTransaction.amount || !newTransaction.category || loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {[
          { id: 'dashboard', icon: Home, label: 'Beranda' },
          { id: 'add-transaction', icon: PlusCircle, label: 'Tambah' },
          { id: 'budget', icon: Target, label: 'Budget' },
          { id: 'goals', icon: Trophy, label: 'Target' },
          { id: 'reports', icon: BarChart3, label: 'Laporan' }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  // Header Component
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">FinanceBI</h1>
            <p className="text-xs text-gray-500">Bank Indonesia Gorontalo</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              setCurrentUser(null);
              setCurrentPage('login');
            }}
            className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );

  // Placeholder components for other pages
  const BudgetPage = () => (
    <div className="text-center py-8">
      <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Management</h3>
      <p className="text-gray-600">Fitur budget sedang dalam pengembangan</p>
    </div>
  );

  const GoalsPage = () => (
    <div className="text-center py-8">
      <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Goals</h3>
      <p className="text-gray-600">Fitur target keuangan sedang dalam pengembangan</p>
    </div>
  );

  const ReportsPage = () => (
    <div className="text-center py-8">
      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Reports</h3>
      <p className="text-gray-600">Fitur laporan keuangan sedang dalam pengembangan</p>
    </div>
  );

  // Main App Render
  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return <LoginPage />;
      case 'risk-assessment':
        return <RiskAssessment />;
      case 'dashboard':
        return <Dashboard />;
      case 'add-transaction':
        return <AddTransaction />;
      case 'budget':
        return <BudgetPage />;
      case 'goals':
        return <GoalsPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  if (currentPage === 'login' || currentPage === 'risk-assessment') {
    return <div className={darkMode ? 'dark' : ''}>{renderPage()}</div>;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
      <Header />
      <main className="pb-20 pt-6 px-4">
        {renderPage()}
      </main>
      <div className="fixed bottom-0 left-0 right-0">
        <Navigation />
      </div>
    </div>
  );
};

export default FinanceApp;
