import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { DashboardEnhanced } from './components/DashboardEnhanced';
import { AuthForm } from './components/AuthForm';
import { AdminAuthForm } from './components/AdminAuthForm';
import { AdminPanelSimple } from './components/AdminPanelSimple';
import { APITestDashboard } from './components/APITestDashboard';
import { MapView } from './components/MapView';
import { MessagingPanel } from './components/MessagingPanel';
import { ProfileView } from './components/ProfileView';
import { ServiceListings } from './components/ServiceListings';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={<LandingPage onGetStarted={() => navigate('/auth')} />} 
      />
      <Route 
        path="/auth" 
        element={<AuthForm onLogin={handleLogin} onBack={() => navigate('/')} />} 
      />
      <Route 
        path="/dashboard/*" 
        element={currentUser ? <DashboardEnhanced user={currentUser} onLogout={handleLogout} /> : <LandingPage onGetStarted={() => navigate('/auth')} />} 
      />
      <Route
        path="/admin/auth"
        element={<AdminAuthForm onLogin={handleLogin} />}
      />
      <Route
        path="/admin/dashboard"
        element={currentUser && currentUser.role === 'admin' ? <DashboardEnhanced user={currentUser} onLogout={handleLogout} /> : <LandingPage onGetStarted={() => navigate('/admin/auth')} />}
      />
      <Route
        path="/dev/api-test"
        element={currentUser ? <APITestDashboard /> : <LandingPage onGetStarted={() => navigate('/auth')} />}
      />

    </Routes>
  );
}

export default App;
