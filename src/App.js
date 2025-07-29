import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Target, User, Settings, BarChart3, PieChart, AlertCircle, CheckCircle, Trophy, Star, Zap, Heart, Briefcase, Home, CreditCard, ShoppingCart, Car, Utensils, Coffee, Gift, Phone, Book, Gamepad2, Plus, Eye, EyeOff, Calendar, Filter, Download, Upload, Bell, Shield, Sun, Moon } from 'lucide-react';

// Supabase configuration - using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const FinanceApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Login state - FIXED: Separate state for form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Memoized auth functions to prevent re-creation
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      alert('Login berhasil!');
      setCurrentUser(data.user);
      setCurrentPage('dashboard');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      alert('Registrasi berhasil! Silakan cek email untuk verifikasi.');
      setIsRegistering(false);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const toggleAuthMode = useCallback(() => {
    setIsRegistering(prev => !prev);
  }, []);

  // Memoized input handlers
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  // Login Component - FIXED: No inline functions
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
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="nama@bi-gorontalo.go.id"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
              autoComplete={isRegistering ? "new-password" : "current-password"}
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
            onClick={toggleAuthMode}
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {isRegistering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </form>
      </div>
    </div>
  );

  // Simple Dashboard
  const Dashboard = () => (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Selamat Datang di FinanceBI!</h2>
      <p className="text-gray-600">Dashboard sedang dalam pengembangan</p>
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
          setCurrentUser(null);
          setCurrentPage('login');
          setEmail('');
          setPassword('');
        }}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );

  if (currentPage === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
    </div>
  );
};

export default FinanceApp;
