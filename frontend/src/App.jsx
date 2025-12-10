import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { DashboardEnhanced } from './components/DashboardEnhanced';
import { AuthForm } from './components/AuthForm';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Load user from local storage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token'); // Clear token on logout
    localStorage.removeItem('user');  // Clear user data on logout
  };

  if (showAuth) {
    return (
      <AuthForm 
        onLogin={handleLogin} 
        onBack={() => setShowAuth(false)}
      />
    );
  }

  if (currentUser) {
    return (
      <DashboardEnhanced 
        user={currentUser} 
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LandingPage 
      onGetStarted={() => setShowAuth(true)}
    />
  );
}

export default App;
