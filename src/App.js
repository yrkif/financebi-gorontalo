import React, { useState, useCallback, memo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DollarSign } from 'lucide-react';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MEMOIZED INPUT COMPONENT - This prevents re-renders!
const InputField = memo(({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required, 
  autoComplete 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
});

// MEMOIZED BUTTON COMPONENT
const Button = memo(({ 
  type = "button", 
  onClick, 
  disabled, 
  className, 
  children 
}) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
});

// MEMOIZED LOGIN FORM COMPONENT
const LoginForm = memo(({ 
  email, 
  password, 
  onEmailChange, 
  onPasswordChange, 
  onSubmit, 
  onToggleMode, 
  isRegistering, 
  loading 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={onEmailChange}
        placeholder="nama@bi-gorontalo.go.id"
        required={true}
        autoComplete="email"
      />
      
      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="••••••••"
        required={true}
        autoComplete={isRegistering ? "new-password" : "current-password"}
      />
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Loading...' : (isRegistering ? 'Daftar' : 'Masuk')}
      </Button>
      
      <Button
        type="button"
        onClick={onToggleMode}
        className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
      >
        {isRegistering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
      </Button>
    </form>
  );
});

// MAIN APP COMPONENT
const FinanceApp = () => {
  // State management - separate primitive states
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Memoized handlers that don't recreate on every render
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handleToggleMode = useCallback(() => {
    setIsRegistering(prev => !prev);
  }, []);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      alert('Login berhasil!');
      setCurrentUser(data.user);
      setCurrentPage('dashboard');
    } catch (error) {
      alert('Login Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      alert('Registrasi berhasil! Silakan cek email untuk verifikasi.');
      setIsRegistering(false);
    } catch (error) {
      alert('Register Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentPage('login');
    setEmail('');
    setPassword('');
  }, []);

  // MEMOIZED LOGIN PAGE COMPONENT
  const LoginPage = memo(() => (
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
        
        <LoginForm
          email={email}
          password={password}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          onSubmit={isRegistering ? handleRegister : handleLogin}
          onToggleMode={handleToggleMode}
          isRegistering={isRegistering}
          loading={loading}
        />
      </div>
    </div>
  ));

  // MEMOIZED DASHBOARD COMPONENT
  const Dashboard = memo(() => (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Selamat Datang di FinanceBI!
        </h2>
        <p className="text-gray-600 mb-4">
          Email: {currentUser?.email}
        </p>
        <p className="text-gray-600 mb-8">
          Dashboard sedang dalam pengembangan
        </p>
        <Button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </Button>
      </div>
    </div>
  ));

  // Render logic
  if (currentPage === 'login') {
    return <LoginPage />;
  }

  return <Dashboard />;
};

export default FinanceApp;
