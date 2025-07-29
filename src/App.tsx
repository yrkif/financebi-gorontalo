import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RiskAssessmentPage from './pages/RiskAssessmentPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import ReportsPage from './pages/ReportsPage';

// Layout
import Layout from '@/components/Layout/Layout';

function App() {
  const { user, setUser, setLoading } = useAuthStore();
  const { darkMode } = useAppStore();

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(userProfile);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div
        className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${
          darkMode ? 'dark' : ''
        }`}
      >
        <Routes>
          {/* Public routes */}
          <Route
            path='/login'
            element={
              !user ? <LoginPage /> : <Navigate to='/dashboard' replace />
            }
          />

          {/* Protected routes */}
          <Route
            path='/risk-assessment'
            element={
              user ? <RiskAssessmentPage /> : <Navigate to='/login' replace />
            }
          />

          {/* Main app routes with layout */}
          <Route
            path='/*'
            element={
              user ? (
                <Layout>
                  <Routes>
                    <Route path='/dashboard' element={<DashboardPage />} />
                    <Route
                      path='/transactions'
                      element={<TransactionsPage />}
                    />
                    <Route path='/budget' element={<BudgetPage />} />
                    <Route path='/goals' element={<GoalsPage />} />
                    <Route path='/reports' element={<ReportsPage />} />
                    <Route
                      path='/'
                      element={<Navigate to='/dashboard' replace />}
                    />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
