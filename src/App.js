const { useState, useEffect } = React;
const { createClient } = supabase;

// Supabase configuration - Use your actual credentials
const supabaseUrl = 'https://6knqq1vsbxq1uwtbtta.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IjZrbnFxMXZzYnhxMXV3dGJ0dGEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNjc2NzQwNiwiZXhwIjoyMDMyMzQzNDA2fQ.eyjpc3MJjJ1aXZXbXYmZzZSIslnjInlsmVVbJ3UWwYJ8CJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IjZkbnFxMXZzYnhxMXV3dGJ0dGEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNjc2NzQwNiwiZXhwIjoyMDMyMzQzNDA2fQ.eyjJc3J1aXRrdzXBYmZSZs1njInJslmVVbJ3UWwYJ8CJ'; // Your anon key
const supabaseClient = createClient(supabaseUrl, supabaseKey);

function FinanceApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // App state
  const [darkMode, setDarkMode] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [goals, setGoals] = useState([]);
  
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

  // Budget form
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  // Goal form
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: 0,
    target_date: '',
    description: ''
  });

  // Categories with Indonesian labels
  const categories = {
    // Income categories
    gaji: { name: 'Gaji', icon: 'briefcase', color: 'text-green-600', type: 'income' },
    bonus: { name: 'Bonus', icon: 'trophy', color: 'text-green-500', type: 'income' },
    investasi: { name: 'Hasil Investasi', icon: 'trending-up', color: 'text-green-400', type: 'income' },
    
    // Expense categories
    makanan: { name: 'Makanan & Minuman', icon: 'utensils', color: 'text-red-500', type: 'expense' },
    transportasi: { name: 'Transportasi', icon: 'car', color: 'text-blue-500', type: 'expense' },
    rumah: { name: 'Rumah & Utilities', icon: 'home', color: 'text-purple-500', type: 'expense' },
    belanja: { name: 'Belanja', icon: 'shopping-cart', color: 'text-pink-500', type: 'expense' },
    hiburan: { name: 'Hiburan', icon: 'gamepad-2', color: 'text-orange-500', type: 'expense' },
    kesehatan: { name: 'Kesehatan', icon: 'heart', color: 'text-red-400', type: 'expense' },
    pendidikan: { name: 'Pendidikan', icon: 'book', color: 'text-indigo-500', type: 'expense' },
    komunikasi: { name: 'Komunikasi', icon: 'phone', color: 'text-gray-500', type: 'expense' },
    hadiah: { name: 'Hadiah & Donasi', icon: 'gift', color: 'text-yellow-500', type: 'expense' }
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

  // Load user data on auth
  useEffect(() => {
    if (currentUser && currentPage === 'dashboard') {
      loadUserData();
    }
  }, [currentUser, currentPage]);

  // Initialize Lucide icons
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [currentPage]);

  async function loadUserData() {
    try {
      // Load user profile
      const { data: userProfile } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (userProfile) {
        setUserData(userProfile);
      }

      // Load transactions
      const { data: transactionsData } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (transactionsData) setTransactions(transactionsData);

      // Load budgets
      const { data: budgetsData } = await supabaseClient
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
      const { data: goalsData } = await supabaseClient
        .from('goals')
        .select('*')
        .eq('user_id', currentUser.id);

      if (goalsData) setGoals(goalsData);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Auth functions
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      setCurrentUser(data.user);
      
      // Check if user has profile
      const { data: userProfile } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userProfile) {
        setUserData(userProfile);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('risk-assessment');
      }
    } catch (error) {
      alert('Login Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      alert('Registrasi berhasil! Silakan login dengan akun Anda.');
      setIsRegistering(false);
    } catch (error) {
      alert('Register Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    setCurrentUser(null);
    setCurrentPage('login');
    setUserData(null);
    setTransactions([]);
    setBudgets({});
    setGoals([]);
    setEmail('');
    setPassword('');
  }

  function toggleAuthMode() {
    setIsRegistering(!isRegistering);
  }

  // Risk Assessment Functions
  function handleRiskAnswer(questionId, answer) {
    setRiskAnswers(prev => ({ ...prev, [questionId]: answer }));
  }

  function nextRiskStep() {
    if (riskAssessmentStep < 5) {
      setRiskAssessmentStep(riskAssessmentStep + 1);
    } else {
      calculateRiskProfile();
    }
  }

  function calculateRiskProfile() {
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
  }

  async function finishRiskAssessment() {
    try {
      const { error } = await supabaseClient
        .from('users')
        .insert({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.user_metadata?.name || currentUser.email.split('@')[0],
          monthly_income: 8500000,
          monthly_expenses: 6200000,
          total_savings: 45000000,
          total_investments: 25000000,
          emergency_fund: 24000000,
          risk_profile: riskProfile.type.toLowerCase().replace(' ', '_')
        });

      if (error) throw error;

      await loadUserData();
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile: ' + error.message);
    }
  }

  // Transaction functions
  async function handleAddTransaction(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabaseClient
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
      await loadUserData();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Budget functions
  async function handleAddBudget(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabaseClient
        .from('budgets')
        .upsert({
          user_id: currentUser.id,
          category: newBudget.category,
          amount: parseFloat(newBudget.amount),
          period: newBudget.period
        });

      if (error) throw error;

      alert('Budget berhasil disimpan!');
      setNewBudget({ category: '', amount: '', period: 'monthly' });
      await loadUserData();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Goal functions
  async function handleAddGoal(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabaseClient
        .from('goals')
        .insert({
          user_id: currentUser.id,
          title: newGoal.title,
          target_amount: parseFloat(newGoal.target_amount),
          current_amount: parseFloat(newGoal.current_amount),
          target_date: newGoal.target_date,
          description: newGoal.description
        });

      if (error) throw error;

      alert('Target keuangan berhasil ditambahkan!');
      setNewGoal({
        title: '',
        target_amount: '',
        current_amount: 0,
        target_date: '',
        description: ''
      });
      await loadUserData();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateGoalProgress(goalId, newAmount) {
    try {
      const { error } = await supabaseClient
        .from('goals')
        .update({ current_amount: parseFloat(newAmount) })
        .eq('id', goalId);

      if (error) throw error;

      await loadUserData();
      alert('Progress target berhasil diupdate!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  // Financial calculations
  function getFinancialStatus() {
    if (!userData) return { overallScore: 0, cashFlow: {}, savings: {}, investment: {}, emergencyMonths: 0 };

    const cashFlowRatio = userData.monthly_income / userData.monthly_expenses;
    const savingsRate = (userData.monthly_income - userData.monthly_expenses) / userData.monthly_income;
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
      cashflow: Math.min(100, Math.max(0, (cashFlowRatio - 1) * 100)),
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
  }

  // Helper function to create icons
  function createIcon(iconName, className = "h-6 w-6") {
    return React.createElement('i', { 
      'data-lucide': iconName, 
      className: className 
    });
  }

  // Login Page
  if (currentPage === 'login') {
    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'
    }, 
      React.createElement('div', {
        className: 'bg-white rounded-2xl shadow-xl p-8 w-full max-w-md'
      },
        React.createElement('div', {
          className: 'text-center mb-8'
        },
          React.createElement('div', {
            className: 'w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'
          },
            createIcon('dollar-sign', 'h-8 w-8 text-white')
          ),
          React.createElement('h1', {
            className: 'text-2xl font-bold text-gray-900'
          }, 'FinanceBI'),
          React.createElement('p', {
            className: 'text-lg text-gray-700'
          }, currentQuestion.question)
        ),
        React.createElement('div', {
          className: 'space-y-4'
        }, currentQuestion.options.map((option, index) =>
          React.createElement('button', {
            key: index,
            onClick: () => {
              handleRiskAnswer(riskAssessmentStep, option);
              setTimeout(nextRiskStep, 300);
            },
            className: 'w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group'
          },
            React.createElement('div', {
              className: 'flex items-center'
            },
              React.createElement('div', {
                className: 'w-6 h-6 border-2 border-gray-300 rounded-full mr-4 group-hover:border-indigo-500'
              }),
              React.createElement('span', {
                className: 'text-gray-700 group-hover:text-indigo-700'
              }, option.text)
            )
          )
        ))
      )
    );
  }

  const financialStatus = getFinancialStatus();

  // Dashboard
  if (currentPage === 'dashboard') {
    return React.createElement('div', {
      className: `min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`
    },
      // Header
      React.createElement('header', {
        className: 'bg-white border-b border-gray-200 px-4 py-3'
      },
        React.createElement('div', {
          className: 'flex items-center justify-between'
        },
          React.createElement('div', {
            className: 'flex items-center'
          },
            React.createElement('div', {
              className: 'w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3'
            },
              createIcon('dollar-sign', 'h-5 w-5 text-white')
            ),
            React.createElement('div', {},
              React.createElement('h1', {
                className: 'text-lg font-bold text-gray-900'
              }, 'FinanceBI'),
              React.createElement('p', {
                className: 'text-xs text-gray-500'
              }, 'Bank Indonesia Gorontalo')
            )
          ),
          React.createElement('div', {
            className: 'flex items-center space-x-3'
          },
            React.createElement('button', {
              onClick: () => setDarkMode(!darkMode),
              className: 'p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            },
              createIcon(darkMode ? 'sun' : 'moon', 'h-5 w-5')
            ),
            React.createElement('button', {
              onClick: handleLogout,
              className: 'flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            },
              createIcon('user', 'h-5 w-5')
            )
          )
        )
      ),

      // Main Content
      React.createElement('main', {
        className: 'pb-20 pt-6 px-4'
      },
        React.createElement('div', {
          className: 'space-y-6'
        },
          // Financial Health Overview
          React.createElement('div', {
            className: 'bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white'
          },
            React.createElement('div', {
              className: 'flex justify-between items-start mb-4'
            },
              React.createElement('div', {},
                React.createElement('h2', {
                  className: 'text-2xl font-bold'
                }, `Halo, ${userData?.name || 'User'}! 👋`),
                React.createElement('p', {
                  className: 'text-blue-100'
                }, 'Selamat datang di dashboard keuangan Anda')
              ),
              React.createElement('div', {
                className: 'text-right'
              },
                React.createElement('div', {
                  className: 'text-3xl font-bold'
                }, `${financialStatus.overallScore}/100`),
                React.createElement('div', {
                  className: 'text-blue-100'
                }, 'Skor Kesehatan')
              )
            ),
            React.createElement('div', {
              className: 'grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'
            },
              React.createElement('div', {
                className: 'bg-white/10 rounded-lg p-3'
              },
                React.createElement('div', {
                  className: 'text-2xl mb-1'
                }, financialStatus.cashFlow.icon),
                React.createElement('div', {
                  className: 'text-sm text-blue-100'
                }, 'Cash Flow'),
                React.createElement('div', {
                  className: 'font-semibold'
                }, financialStatus.cashFlow.status)
              ),
              React.createElement('div', {
                className: 'bg-white/10 rounded-lg p-3'
              },
                React.createElement('div', {
                  className: 'text-2xl mb-1'
                }, financialStatus.savings.badge),
                React.createElement('div', {
                  className: 'text-sm text-blue-100'
                }, 'Saving Profile'),
                React.createElement('div', {
                  className: 'font-semibold text-sm'
                }, financialStatus.savings.type)
              ),
              React.createElement('div', {
                className: 'bg-white/10 rounded-lg p-3'
              },
                React.createElement('div', {
                  className: 'text-2xl mb-1'
                }, financialStatus.investment.rank),
                React.createElement('div', {
                  className: 'text-sm text-blue-100'
                }, 'Investment'),
                React.createElement('div', {
                  className: 'font-semibold text-sm'
                }, financialStatus.investment.level)
              ),
              React.createElement('div', {
                className: 'bg-white/10 rounded-lg p-3'
              },
                React.createElement('div', {
                  className: 'text-2xl mb-1'
                }, '🛡️'),
                React.createElement('div', {
                  className: 'text-sm text-blue-100'
                }, 'Emergency Fund'),
                React.createElement('div', {
                  className: 'font-semibold'
                }, `${financialStatus.emergencyMonths} bulan`)
              )
            )
          ),

          // Financial Summary Cards
          React.createElement('div', {
            className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
          },
            React.createElement('div', {
              className: 'bg-white rounded-2xl p-6 shadow-sm'
            },
              React.createElement('div', {
                className: 'flex items-center justify-between mb-4'
              },
                React.createElement('div', {
                  className: 'p-2 bg-green-100 rounded-lg'
                },
                  createIcon('trending-up', 'h-6 w-6 text-green-600')
                ),
                React.createElement('button', {
                  onClick: () => setShowBalance(!showBalance)
                },
                  createIcon(showBalance ? 'eye' : 'eye-off', 'h-5 w-5 text-gray-400')
                )
              ),
              React.createElement('div', {
                className: 'text-2xl font-bold text-gray-900'
              }, showBalance ? `Rp ${userData?.monthly_income?.toLocaleString() || '0'}` : '••••••••'),
              React.createElement('div', {
                className: 'text-gray-600 text-sm'
              }, 'Pendapatan Bulanan')
            ),
            React.createElement('div', {
              className: 'bg-white rounded-2xl p-6 shadow-sm'
            },
              React.createElement('div', {
                className: 'flex items-center justify-between mb-4'
              },
                React.createElement('div', {
                  className: 'p-2 bg-red-100 rounded-lg'
                },
                  createIcon('trending-down', 'h-6 w-6 text-red-600')
                )
              ),
              React.createElement('div', {
                className: 'text-2xl font-bold text-gray-900'
              }, showBalance ? `Rp ${userData?.monthly_expenses?.toLocaleString() || '0'}` : '••••••••'),
              React.createElement('div', {
                className: 'text-gray-600 text-sm'
              }, 'Pengeluaran Bulanan')
            ),
            React.createElement('div', {
              className: 'bg-white rounded-2xl p-6 shadow-sm'
            },
              React.createElement('div', {
                className: 'flex items-center justify-between mb-4'
              },
                React.createElement('div', {
                  className: 'p-2 bg-blue-100 rounded-lg'
                },
                  createIcon('dollar-sign', 'h-6 w-6 text-blue-600')
                )
              ),
              React.createElement('div', {
                className: 'text-2xl font-bold text-gray-900'
              }, showBalance ? `Rp ${userData?.total_savings?.toLocaleString() || '0'}` : '••••••••'),
              React.createElement('div', {
                className: 'text-gray-600 text-sm'
              }, 'Total Tabungan')
            ),
            React.createElement('div', {
              className: 'bg-white rounded-2xl p-6 shadow-sm'
            },
              React.createElement('div', {
                className: 'flex items-center justify-between mb-4'
              },
                React.createElement('div', {
                  className: 'p-2 bg-purple-100 rounded-lg'
                },
                  createIcon('bar-chart-3', 'h-6 w-6 text-purple-600')
                )
              ),
              React.createElement('div', {
                className: 'text-2xl font-bold text-gray-900'
              }, showBalance ? `Rp ${userData?.total_investments?.toLocaleString() || '0'}` : '••••••••'),
              React.createElement('div', {
                className: 'text-gray-600 text-sm'
              }, 'Total Investasi')
            )
          ),

          // Quick Actions
          React.createElement('div', {
            className: 'bg-white rounded-2xl p-6 shadow-sm'
          },
            React.createElement('h3', {
              className: 'text-xl font-bold text-gray-900 mb-4'
            }, 'Aksi Cepat'),
            React.createElement('div', {
              className: 'grid grid-cols-2 md:grid-cols-4 gap-4'
            },
              React.createElement('button', {
                onClick: () => setCurrentPage('add-transaction'),
                className: 'flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors'
              },
                createIcon('plus-circle', 'h-8 w-8 text-blue-600 mb-2'),
                React.createElement('span', {
                  className: 'text-sm font-medium text-blue-600'
                }, 'Tambah Transaksi')
              ),
              React.createElement('button', {
                onClick: () => setCurrentPage('budget'),
                className: 'flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors'
              },
                createIcon('target', 'h-8 w-8 text-green-600 mb-2'),
                React.createElement('span', {
                  className: 'text-sm font-medium text-green-600'
                }, 'Atur Budget')
              ),
              React.createElement('button', {
                onClick: () => setCurrentPage('goals'),
                className: 'flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors'
              },
                createIcon('trophy', 'h-8 w-8 text-purple-600 mb-2'),
                React.createElement('span', {
                  className: 'text-sm font-medium text-purple-600'
                }, 'Target Keuangan')
              ),
              React.createElement('button', {
                onClick: () => setCurrentPage('reports'),
                className: 'flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors'
              },
                createIcon('bar-chart-3', 'h-8 w-8 text-orange-600 mb-2'),
                React.createElement('span', {
                  className: 'text-sm font-medium text-orange-600'
                }, 'Laporan')
              )
            )
          )
        )
      ),

      // Bottom Navigation
      React.createElement('nav', {
        className: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2'
      },
        React.createElement('div', {
          className: 'flex justify-around'
        },
          [
            { id: 'dashboard', icon: 'home', label: 'Beranda' },
            { id: 'add-transaction', icon: 'plus-circle', label: 'Tambah' },
            { id: 'budget', icon: 'target', label: 'Budget' },
            { id: 'goals', icon: 'trophy', label: 'Target' },
            { id: 'reports', icon: 'bar-chart-3', label: 'Laporan' }
          ].map((item) => {
            const isActive = currentPage === item.id;
            return React.createElement('button', {
              key: item.id,
              onClick: () => setCurrentPage(item.id),
              className: `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`
            },
              createIcon(item.icon, 'h-6 w-6 mb-1'),
              React.createElement('span', {
                className: 'text-xs font-medium'
              }, item.label)
            );
          })
        )
      )
    );
  }

  // Add Transaction Page
  if (currentPage === 'add-transaction') {
    const expenseCategories = Object.entries(categories).filter(([_, cat]) => cat.type === 'expense');
    const incomeCategories = Object.entries(categories).filter(([_, cat]) => cat.type === 'income');
    const currentCategories = newTransaction.type === 'expense' ? expenseCategories : incomeCategories;

    return React.createElement('div', {
      className: `min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`
    },
      React.createElement('header', {
        className: 'bg-white border-b border-gray-200 px-4 py-3'
      },
        React.createElement('div', {
          className: 'flex items-center justify-between'
        },
          React.createElement('button', {
            onClick: () => setCurrentPage('dashboard'),
            className: 'p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
          }, '← Kembali'),
          React.createElement('h1', {
            className: 'text-lg font-bold text-gray-900'
          }, 'Tambah Transaksi'),
          React.createElement('div', {})
        )
      ),
      React.createElement('main', {
        className: 'pt-6 px-4 pb-20'
      },
        React.createElement('div', {
          className: 'max-w-2xl mx-auto'
        },
          React.createElement('div', {
            className: 'bg-white rounded-2xl p-6 shadow-sm'
          },
            React.createElement('form', {
              onSubmit: handleAddTransaction,
              className: 'space-y-6'
            },
              // Transaction Type
              React.createElement('div', {},
                React.createElement('label', {
                  className: 'block text-sm font-medium text-gray-700 mb-3'
                }, 'Jenis Transaksi'),
                React.createElement('div', {
                  className: 'flex space-x-4'
                },
                  React.createElement('button', {
                    type: 'button',
                    onClick: () => setNewTransaction(prev => ({ ...prev, type: 'expense', category: '' })),
                    className: `flex-1 p-4 rounded-xl border-2 transition-colors ${
                      newTransaction.type === 'expense' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`
                  },
                    createIcon('trending-down', 'h-6 w-6 mx-auto mb-2'),
                    React.createElement('div', {
                      className: 'font-medium'
                    }, 'Pengeluaran')
                  ),
                  React.createElement('button', {
                    type: 'button',
                    onClick: () => setNewTransaction(prev => ({ ...prev, type: 'income', category: '' })),
                    className: `flex-1 p-4 rounded-xl border-2 transition-colors ${
                      newTransaction.type === 'income' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`
                  },
                    createIcon('trending-up', 'h-6 w-6 mx-auto mb-2'),
                    React.createElement('div', {
                      className: 'font-medium'
                    }, 'Pemasukan')
                  )
                )
              ),

              // Amount
              React.createElement('div', {},
                React.createElement('label', {
                  className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Jumlah'),
                React.createElement('div', {
                  className: 'relative'
                },
                  React.createElement('span', {
                    className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'
                  }, 'Rp'),
                  React.createElement('input', {
                    type: 'number',
                    value: newTransaction.amount,
                    onChange: (e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value })),
                    className: 'w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    placeholder: '0',
                    required: true
                  })
                )
              ),

              // Category
              React.createElement('div', {},
                React.createElement('label', {
                  className: 'block text-sm font-medium text-gray-700 mb-3'
                }, 'Kategori'),
                React.createElement('div', {
                  className: 'grid grid-cols-2 md:grid-cols-3 gap-3'
                }, currentCategories.map(([key, category]) =>
                  React.createElement('button', {
                    key: key,
                    type: 'button',
                    onClick: () => setNewTransaction(prev => ({ ...prev, category: key })),
                    className: `p-4 rounded-xl border-2 transition-colors text-left ${
                      newTransaction.category === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`
                  },
                    createIcon(category.icon, `h-6 w-6 ${category.color} mb-2`),
                    React.createElement('div', {
                      className: 'font-medium text-gray-900 text-sm'
                    }, category.name)
                  )
                ))
              ),

              // Description
              React.createElement('div', {},
                React.createElement('label', {
                  className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Keterangan (Opsional)'),
                React.createElement('input', {
                  type: 'text',
                  value: newTransaction.description,
                  onChange: (e) => setNewTransaction(prev => ({ ...prev, description: e.target.value })),
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  placeholder: 'Contoh: Makan siang di kantin'
                })
              ),

              // Date
              React.createElement('div', {},
                React.createElement('label', {
                  className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Tanggal'),
                React.createElement('input', {
                  type: 'date',
                  value: newTransaction.date,
                  onChange: (e) => setNewTransaction(prev => ({ ...prev, date: e.target.value })),
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  required: true
                })
              ),

              // Submit Button
              React.createElement('div', {
                className: 'flex space-x-4'
              },
                React.createElement('button', {
                  type: 'submit',
                  disabled: !newTransaction.amount || !newTransaction.category || loading,
                  className: 'flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                }, loading ? 'Menyimpan...' : 'Simpan Transaksi'),
                React.createElement('button', {
                  type: 'button',
                  onClick: () => setCurrentPage('dashboard'),
                  className: 'px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors'
                }, 'Batal')
              )
            )
          )
        )
      )
    );
  }

  // Budget Management Page
  if (currentPage === 'budget') {
    const expenseCategories = Object.entries(categories).filter(([_, cat]) => cat.type === 'expense');
    
    return React.createElement('div', {
      className: `min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`
    },
      React.createElement('header', {
        className: 'bg-white border-b border-gray-200 px-4 py-3'
      },
        React.createElement('div', {
          className: 'flex items-center justify-between'
        },
          React.createElement('button', {
            onClick: () => setCurrentPage('dashboard'),
            className: 'p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
          }, '← Kembali'),
          React.createElement('h1', {
            className: 'text-lg font-bold text-gray-900'
          }, 'Budget Management'),
          React.createElement('div', {})
        )
      ),
      React.createElement('main', {
        className: 'pt-6 px-4 pb-20'
      },
        React.createElement('div', {
          className: 'max-w-4xl mx-auto space-y-6'
        },
          // Add Budget Form
          React.createElement('div', {
            className: 'bg-white rounded-2xl p-6 shadow-sm'
          },
            React.createElement('h3', {
              className: 'text-xl font-bold text-gray-900 mb-4'
            }, 'Tambah Budget Baru'),
            React.createElement('form', {
              onSubmit: handleAddBudget,
              className: 'space-y-4'
            },
              React.createElement('div', {
                className: 'grid grid-cols-1 md:grid-cols-3 gap-4'
              },
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Kategori'),
                  React.createElement('select', {
                    value: newBudget.category,
                    onChange: (e) => setNewBudget(prev => ({ ...prev, category: e.target.value })),
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    required: true
                  },
                    React.createElement('option', { value: '' }, 'Pilih Kategori'),
                    expenseCategories.map(([key, category]) =>
                      React.createElement('option', { key: key, value: key }, category.name)
                    )
                  )
                ),
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Jumlah Budget'),
                  React.createElement('input', {
                    type: 'number',
                    value: newBudget.amount,
                    onChange: (e) => setNewBudget(prev => ({ ...prev, amount: e.target.value })),
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    placeholder: 'Rp 0',
                    required: true
                  })
                ),
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Periode'),
                  React.createElement('select', {
                    value: newBudget.period,
                    onChange: (e) => setNewBudget(prev => ({ ...prev, period: e.target.value })),
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  },
                    React.createElement('option', { value: 'monthly' }, 'Bulanan'),
                    React.createElement('option', { value: 'weekly' }, 'Mingguan'),
                    React.createElement('option', { value: 'yearly' }, 'Tahunan')
                  )
                )
              ),
              React.createElement('button', {
                type: 'submit',
                disabled: !newBudget.category || !newBudget.amount || loading,
                className: 'w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors'
              }, loading ? 'Menyimpan...' : 'Simpan Budget')
            )
          ),

          // Current Budgets
          React.createElement('div', {
            className: 'bg-white rounded-2xl p-6 shadow-sm'
          },
            React.createElement('h3', {
              className: 'text-xl font-bold text-gray-900 mb-4'
            }, 'Budget Saat Ini'),
            React.createElement('div', {
              className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            },
              Object.entries(budgets).length === 0 
                ? React.createElement('p', {
                    className: 'text-gray-500 col-span-full text-center py-8'
                  }, 'Belum ada budget yang ditetapkan. Tambahkan budget pertama Anda!')
                : Object.entries(budgets).map(([category, amount]) => {
                    const categoryInfo = categories[category];
                    const spent = transactions
                      .filter(t => t.category === category && t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0);
                    const percentage = (spent / amount) * 100;
                    
                    return React.createElement('div', {
                      key: category,
                      className: 'border border-gray-200 rounded-lg p-4'
                    },
                      React.createElement('div', {
                        className: 'flex items-center mb-3'
                      },
                        createIcon(categoryInfo?.icon || 'circle', `h-5 w-5 ${categoryInfo?.color || 'text-gray-500'} mr-2`),
                        React.createElement('h4', {
                          className: 'font-semibold text-gray-900'
                        }, categoryInfo?.name || category)
                      ),
                      React.createElement('div', {
                        className: 'space-y-2'
                      },
                        React.createElement('div', {
                          className: 'flex justify-between text-sm'
                        },
                          React.createElement('span', {}, `Terpakai: Rp ${spent.toLocaleString()}`),
                          React.createElement('span', {}, `Budget: Rp ${amount.toLocaleString()}`)
                        ),
                        React.createElement('div', {
                          className: 'w-full bg-gray-200 rounded-full h-2'
                        },
                          React.createElement('div', {
                            className: `h-2 rounded-full transition-all ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`,
                            style: { width: `${Math.min(percentage, 100)}%` }
                          })
                        ),
                        React.createElement('div', {
                          className: `text-xs font-medium ${percentage > 100 ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'}`
                        }, `${percentage.toFixed(1)}% terpakai`)
                      )
                    );
                  })
            )
          )
        )
      )
    );
  }

  // Goals Management Page
  if (currentPage === 'goals') {
    return React.createElement('div', {
      className: `min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`
    },
      React.createElement('header', {
        className: 'bg-white border-b border-gray-200 px-4 py-3'
      },
        React.createElement('div', {
          className: 'flex items-center justify-between'
        },
          React.createElement('button', {
            onClick: () => setCurrentPage('dashboard'),
            className: 'p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
          }, '← Kembali'),
          React.createElement('h1', {
            className: 'text-lg font-bold text-gray-900'
          }, 'Target Keuangan'),
          React.createElement('div', {})
        )
      ),
      React.createElement('main', {
        className: 'pt-6 px-4 pb-20'
      },
        React.createElement('div', {
          className: 'max-w-4xl mx-auto space-y-6'
        },
          // Add Goal Form
          React.createElement('div', {
            className: 'bg-white rounded-2xl p-6 shadow-sm'
          },
            React.createElement('h3', {
              className: 'text-xl font-bold text-gray-900 mb-4'
            }, 'Tambah Target Baru'),
            React.createElement('form', {
              onSubmit: handleAddGoal,
              className: 'space-y-4'
            },
              React.createElement('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
              },
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Nama Target'),
                  React.createElement('input', {
                    type: 'text',
                    value: newGoal.title,
                    onChange: (e) => setNewGoal(prev => ({ ...prev, title: e.target.value })),
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    placeholder: 'Contoh: Liburan ke Bali',
                    required: true
                  })
                ),
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Target Jumlah'),
                  React.createElement('input', {
                    type: 'number',
                    value: newGoal.target_amount,
                    onChange: (e) => setNewGoal(prev => ({ ...prev, target_amount: e.target.value })),
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    placeholder: 'Rp 0',
                    required: true
                  })
                ),
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Jumlah Saat Ini'),
                  React.createElement('input', {
                    type: 'number',
                    value: newGoal.current_amount,
                    onChange: (e) => setNewGoal(prev => ({ ...prev, current_amount: e.target.value })),
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    placeholder: 'Rp 0'
                  })
                ),
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Target Tanggal'),
                  React.createElement('input', {
                    type: 'date',
                    value: newGoal.target_date,
                    onChange: (e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value })),
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    required: true
                  })
                )
              ),
              React.createElement('div', {},
                React.createElement('label', {
                  className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Deskripsi (Opsional)'),
                React.createElement('textarea', {
                  value: newGoal.description,
                  onChange: (e) => setNewGoal(prev => ({ ...prev, description: e.target.value })),
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  placeholder: 'Jelaskan detail target Anda...',
                  rows: 3
                })
              ),
              React.createElement('button', {
                type: 'submit',
                disabled: !newGoal.title || !newGoal.target_amount || !newGoal.target_date || loading,
                className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors'
              }, loading ? 'Menyimpan...' : 'Simpan Target')
            )
          ),

          // Current Goals
          React.createElement('div', {
            className: 'bg-white rounded-2xl p-6 shadow-sm'
          },
            React.createElement('h3', {
              className: 'text-xl font-bold text-gray-900 mb-4'
            }, 'Target Keuangan Anda'),
            React.createElement('div', {
              className: 'space-y-4'
            },
              goals.length === 0 
                ? React.createElement('p', {
                    className: 'text-gray-500 text-center py-8'
                  }, 'Belum ada target keuangan. Buat target pertama Anda!')
                : goals.map((goal) => {
                    const percentage = (goal.current_amount / goal.target_amount) * 100;
                    const remaining = goal.target_amount - goal.current_amount;
                    const daysLeft = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24));
                    
                    return React.createElement('div', {
                      key: goal.id,
                      className: 'border border-gray-200 rounded-lg p-6'
                    },
                      React.createElement('div', {
                        className: 'flex justify-between items-start mb-4'
                      },
                        React.createElement('div', {},
                          React.createElement('h4', {
                            className: 'text-lg font-semibold text-gray-900'
                          }, goal.title),
                          goal.description && React.createElement('p', {
                            className: 'text-gray-600 text-sm mt-1'
                          }, goal.description)
                        ),
                        React.createElement('div', {
                          className: 'text-right'
                        },
                          React.createElement('div', {
                            className: 'text-sm text-gray-500'
                          }, `${daysLeft > 0 ? `${daysLeft} hari lagi` : 'Target tercapai!'}`),
                          React.createElement('div', {
                            className: 'text-sm font-medium'
                          }, new Date(goal.target_date).toLocaleDateString('id-ID'))
                        )
                      ),
                      React.createElement('div', {
                        className: 'space-y-3'
                      },
                        React.createElement('div', {
                          className: 'flex justify-between text-sm'
                        },
                          React.createElement('span', {}, `Progress: Rp ${goal.current_amount.toLocaleString()}`),
                          React.createElement('span', {}, `Target: Rp ${goal.target_amount.toLocaleString()}`)
                        ),
                        React.createElement('div', {
                          className: 'w-full bg-gray-200 rounded-full h-3'
                        },
                          React.createElement('div', {
                            className: `h-3 rounded-full transition-all ${percentage >= 100 ? 'bg-green-500' : percentage >= 75 ? 'bg-blue-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-gray-400'}`,
                            style: { width: `${Math.min(percentage, 100)}%` }
                          })
                        ),
                        React.createElement('div', {
                          className: 'flex justify-between items-center'
                        },
                          React.createElement('span', {
                            className: 'text-sm font-medium'
                          }, `${percentage.toFixed(1)}% tercapai`),
                          remaining > 0 && React.createElement('span', {
                            className: 'text-sm text-gray-600'
                          }, `Sisa: Rp ${remaining.toLocaleString()}`)
                        ),
                        React.createElement('div', {
                          className: 'flex space-x-2 mt-4'
                        },
                          React.createElement('input', {
                            type: 'number',
                            placeholder: 'Update progress',
                            className: 'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                            onKeyPress: (e) => {
                              if (e.key === 'Enter') {
                                updateGoalProgress(goal.id, e.target.value);
                                e.target.value = '';
                              }
                            }
                          }),
                          React.createElement('button', {
                            onClick: (e) => {
                              const input = e.target.previousElementSibling;
                              if (input.value) {
                                updateGoalProgress(goal.id, input.value);
                                input.value = '';
                              }
                            },
                            className: 'px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors'
                          }, 'Update')
                        )
                      )
                    );
                  })
            )
          )
        )
      )
    );
  }

  // Reports Page
  if (currentPage === 'reports') {
    const monthlyExpensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {});

    const monthlyIncomesByCategory = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {});

    const totalExpenses = Object.values(monthlyExpensesByCategory).reduce((sum, amount) => sum + amount, 0);
    const totalIncome = Object.values(monthlyIncomesByCategory).reduce((sum, amount) => sum + amount, 0);

    return React.createElement('div', {
      className: `min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`
    },
      React.createElement('header', {
        className: 'bg-white border-b border-gray-200 px-4 py-3'
      },
        React.createElement('div', {
          className: 'flex items-center justify-between'
        },
          React.createElement('button', {
            onClick: () => setCurrentPage('dashboard'),
            className: 'p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
          }, '← Kembali'),
          React.createElement('h1', {
            className: 'text-lg font-bold text-gray-900'
          }, 'Laporan Keuangan'),
          React.createElement('div', {})
        )
      ),
      React.createElement('main', {
        className: 'pt-6 px-4 pb-20'
      },
        React.createElement('div', {
          className: 'max-w-6xl mx-auto space-y-6'
        },
          // Summary Cards
          React.createElement('div', {
            className: 'grid grid-cols-1 md:grid-cols-3 gap-6'
          },
            React.createElement('div', {
              className: 'bg-white rounded-2xl p-6 shadow-sm'
            },
              React.createElement('div', {
                className: 'flex items-center justify-between mb-4'
              },
                React.createElement('div', {
                  className: 'p-3 bg-green-100 rounded-lg'
                },
                  createIcon('trending-up', 'h-6 w-6 text-green-600')
                )
              ),
              React.createElement('div', {
                className: 'text-2xl font-bold text-gray-900'
              }, `Rp ${totalIncome.toLocaleString()}`),
              React.createElement('div', {
                className: 'text-gray-600 text-sm'
              }, 'Total Pemasukan'),
              React.createElement('div', {
                className: 'text-green-600 text-sm font-medium mt-2'
              }, `${transactions.filter(t => t.type === 'income').length} transaksi`)
            ),
            React.createElement('div', {
              className: 'bg-white rounded-2xl p-6 shadow-sm'
            },
              React.createElement('div', {
                className: 'flex items-center justify-between mb-4'
              },
                React.createElement('div', {
                  className: 'p-3 bg-red-100 rounded-lg'
                },
                  createIcon('trending-down', 'h-6 w-6 text-red-600')
                )
              ),
              React.createElement('div', {
                className: 'text-2xl font-bold text-gray-900'
              }, `Rp ${totalExpenses.toLocaleString()}`),
              React.createElement('div', {
                className: 'text-gray-600 text-sm'
              }, 'Total Pengeluaran'),
              React.createElement('div', {
                className: 'text-red-600 text-sm font-medium mt-2'
              }, `${transactions.filter(t => t.type === 'expense').length} transaksi`)
            ),
            React.createElement('div', {
              className: 'bg-white rounded-2xl p-6 shadow-sm'
            },
              React.createElement('div', {
                className: 'flex items-center justify-between mb-4'
              },
                React.createElement('div', {
                  className: `p-3 ${totalIncome - totalExpenses >= 0 ? 'bg-blue-100' : 'bg-yellow-100'} rounded-lg`
                },
                  createIcon('dollar-sign', `h-6 w-6 ${totalIncome - totalExpenses >= 0 ? 'text-blue-600' : 'text-yellow-600'}`)
                )
              ),
              React.createElement('div', {
                className: 'text-2xl font-bold text-gray-900'
              }, `Rp ${(totalIncome - totalExpenses).toLocaleString()}`),
              React.createElement('div', {
                className: 'text-gray-600 text-sm'
              }, 'Net Cash Flow'),
              React.createElement('div', {
                className: `${totalIncome - totalExpenses >= 0 ? 'text-blue-600' : 'text-yellow-600'} text-sm font-medium mt-2`
              }, totalIncome - totalExpenses >= 0 ? 'Surplus' : 'Defisit')
            )
          ),

          // Expense Breakdown
          React.createElement('div', {
            className: 'bg-white rounded-2xl p-6 shadow-sm'
          },
            React.createElement('h3', {
              className: 'text-xl font-bold text-gray-900 mb-6'
            }, 'Breakdown Pengeluaran'),
            React.createElement('div', {
              className: 'space-y-4'
            },
              Object.entries(monthlyExpensesByCategory).length === 0 
                ? React.createElement('p', {
                    className: 'text-gray-500 text-center py-8'
                  }, 'Belum ada data pengeluaran untuk ditampilkan.')
                : Object.entries(monthlyExpensesByCategory)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, amount]) => {
                      const categoryInfo = categories[category];
                      const percentage = (amount / totalExpenses) * 100;
                      
                      return React.createElement('div', {
                        key: category,
                        className: 'flex items-center justify-between p-4 border border-gray-200 rounded-lg'
                      },
                        React.createElement('div', {
                          className: 'flex items-center'
                        },
                          createIcon(categoryInfo?.icon || 'circle', `h-6 w-6 ${categoryInfo?.color || 'text-gray-500'} mr-3`),
                          React.createElement('div', {},
                            React.createElement('div', {
                              className: 'font-medium text-gray-900'
                            }, categoryInfo?.name || category),
                            React.createElement('div', {
                              className: 'text-sm text-gray-500'
                            }, `${percentage.toFixed(1)}% dari total pengeluaran`)
                          )
                        ),
                        React.createElement('div', {
                          className: 'text-right'
                        },
                          React.createElement('div', {
                            className: 'font-semibold text-gray-900'
                          }, `Rp ${amount.toLocaleString()}`),
                          budgets[category] && React.createElement('div', {
                            className: `text-sm ${amount > budgets[category] ? 'text-red-600' : 'text-green-600'}`
                          }, `Budget: Rp ${budgets[category].toLocaleString()}`)
                        )
                      );
                    })
            )
          ),

          // Recent Transactions
          React.createElement('div', {
            className: 'bg-white rounded-2xl p-6 shadow-sm'
          },
            React.createElement('h3', {
              className: 'text-xl font-bold text-gray-900 mb-6'
            }, 'Transaksi Terbaru'),
            React.createElement('div', {
              className: 'space-y-3'
            },
              transactions.length === 0 
                ? React.createElement('p', {
                    className: 'text-gray-500 text-center py-8'
                  }, 'Belum ada transaksi untuk ditampilkan.')
                : transactions.slice(0, 10).map((transaction) => {
                    const categoryInfo = categories[transaction.category];
                    
                    return React.createElement('div', {
                      key: transaction.id,
                      className: 'flex items-center justify-between p-4 border border-gray-200 rounded-lg'
                    },
                      React.createElement('div', {
                        className: 'flex items-center'
                      },
                        createIcon(categoryInfo?.icon || 'circle', `h-5 w-5 ${categoryInfo?.color || 'text-gray-500'} mr-3`),
                        React.createElement('div', {},
                          React.createElement('div', {
                            className: 'font-medium text-gray-900'
                          }, transaction.description || categoryInfo?.name || transaction.category),
                          React.createElement('div', {
                            className: 'text-sm text-gray-500'
                          }, new Date(transaction.date).toLocaleDateString('id-ID'))
                        )
                      ),
                      React.createElement('div', {
                        className: `font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`
                      }, `${transaction.type === 'income' ? '+' : '-'}Rp ${transaction.amount.toLocaleString()}`)
                    );
                  })
            )
          )
        )
      )
    );
  }

  return React.createElement('div', {}, 'Loading...');
}

// Initialize the app
const { createRoot } = ReactDOM;
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(FinanceApp));gray-600 mt-2'
          }, 'Personal Finance Management'),
          React.createElement('p', {
            className: 'text-sm text-blue-600 font-medium'
          }, 'Bank Indonesia Gorontalo')
        ),
        
        React.createElement('form', {
          onSubmit: isRegistering ? handleRegister : handleLogin,
          className: 'space-y-4'
        },
          React.createElement('div', {},
            React.createElement('label', {
              className: 'block text-sm font-medium text-gray-700 mb-2'
            }, 'Email'),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: (e) => setEmail(e.target.value),
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              placeholder: 'fikry.ma@gmail.com',
              required: true
            })
          ),
          React.createElement('div', {},
            React.createElement('label', {
              className: 'block text-sm font-medium text-gray-700 mb-2'
            }, 'Password'),
            React.createElement('input', {
              type: 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              placeholder: '••••••••',
              required: true
            })
          ),
          React.createElement('button', {
            type: 'submit',
            disabled: loading,
            className: 'w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors'
          }, loading ? 'Loading...' : (isRegistering ? 'Daftar' : 'Masuk')),
          React.createElement('button', {
            type: 'button',
            onClick: toggleAuthMode,
            className: 'w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors'
          }, isRegistering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar')
        )
      )
    );
  }

  // Risk Assessment Page (keeping existing logic)
  if (currentPage === 'risk-assessment') {
    if (riskProfile) {
      return React.createElement('div', {
        className: 'min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4'
      },
        React.createElement('div', {
          className: 'bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl'
        },
          React.createElement('div', {
            className: 'text-center mb-8'
          },
            React.createElement('div', {
              className: 'text-6xl mb-4'
            }, riskProfile.icon),
            React.createElement('h2', {
              className: 'text-3xl font-bold text-gray-900'
            }, riskProfile.type),
            React.createElement('p', {
              className: `text-xl ${riskProfile.color} font-semibold mt-2`
            }, riskProfile.description)
          ),
          React.createElement('div', {
            className: 'space-y-6'
          },
            React.createElement('div', {},
              React.createElement('h3', {
                className: 'text-lg font-semibold text-gray-900 mb-3'
              }, 'Karakteristik Anda:'),
              React.createElement('ul', {
                className: 'space-y-2'
              }, riskProfile.characteristics.map((char, index) =>
                React.createElement('li', {
                  key: index,
                  className: 'flex items-center text-gray-700'
                },
                  createIcon('check-circle', 'h-5 w-5 text-green-500 mr-3'),
                  char
                )
              ))
            ),
            React.createElement('div', {},
              React.createElement('h3', {
                className: 'text-lg font-semibold text-gray-900 mb-3'
              }, 'Rekomendasi Investasi:'),
              React.createElement('p', {
                className: 'text-gray-700 bg-gray-50 p-4 rounded-lg'
              }, riskProfile.recommendation)
            ),
            React.createElement('button', {
              onClick: finishRiskAssessment,
              className: 'w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors'
            }, 'Mulai Kelola Keuangan Saya')
          )
        )
      );
    }

    const currentQuestion = riskQuestions[riskAssessmentStep];

    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4'
    },
      React.createElement('div', {
        className: 'bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl'
      },
        React.createElement('div', {
          className: 'mb-8'
        },
          React.createElement('div', {
            className: 'flex justify-between items-center mb-4'
          },
            React.createElement('span', {
              className: 'text-sm font-medium text-indigo-600'
            }, `Langkah ${riskAssessmentStep} dari 5`),
            React.createElement('span', {
              className: 'text-sm text-gray-500'
            }, `${Math.round((riskAssessmentStep / 5) * 100)}% selesai`)
          ),
          React.createElement('div', {
            className: 'w-full bg-gray-200 rounded-full h-2'
          },
            React.createElement('div', {
              className: 'bg-indigo-600 h-2 rounded-full transition-all duration-300',
              style: { width: `${(riskAssessmentStep / 5) * 100}%` }
            })
          )
        ),
        React.createElement('div', {
          className: 'mb-8'
        },
          React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900 mb-2'
          }, currentQuestion.title),
          React.createElement('p', {
            className: 'text-
