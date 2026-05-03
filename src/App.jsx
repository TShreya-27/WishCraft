import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Auth from './components/Auth';
import About from './components/About';
import HowToUse from './components/HowToUse';
import Premium from './components/Premium';
import Footer from './components/Footer';
import Editor from './components/Editor';
import Dashboard from './components/Dashboard';
import Browse from './components/Browse';
import PremiumPopup from './components/PremiumPopup';
import useUserProfile, { clearCachedProfile } from './hooks/useUserProfile';

function App() {
  const [location, setLocation] = useState(`${window.location.pathname}${window.location.hash}`);
  const { profile, isAuthed, authReady } = useUserProfile();

  useEffect(() => {
    const onPopState = () => setLocation(`${window.location.pathname}${window.location.hash}`);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to);
    setLocation(`${window.location.pathname}${window.location.hash}`);
  }, []);

  const path = location.split('#')[0] || '/';
  const hash = location.includes('#') ? location.slice(location.indexOf('#')) : '';

  useEffect(() => {
    if (!authReady) return;

    if ((path === '/edit' || path === '/dashboard') && !isAuthed) {
      localStorage.setItem('wishcraft_post_auth_redirect', path);
      navigate('/login');
      return;
    }

    if (hash && path === '/') {
      const id = hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [hash, path, isAuthed, authReady, navigate]);

  const isLogin = path === '/login';
  const isSignup = path === '/signup';
  const isAuthPage = isLogin || isSignup;
  const isEdit = path === '/edit';
  const isDashboard = path === '/dashboard';
  const isPremium = path === '/premium';
  const isBrowse = path === '/browse';

  const handleAuthSuccess = () => {
    const redirectTo = localStorage.getItem('wishcraft_post_auth_redirect') || '/dashboard';
    localStorage.removeItem('wishcraft_post_auth_redirect');
    navigate(redirectTo);
  };

  const handleSignOut = () => {
    clearCachedProfile();
    navigate('/');
  };

  return (
    <div className="App">
      {authReady && !(isEdit || isPremium || isBrowse || isDashboard) ? (
        <Header onNavigate={navigate} isAuthed={isAuthed} profile={profile} />
      ) : null}
      {isEdit ? (
        <Editor onSignOut={handleSignOut} profile={profile} />
      ) : isDashboard ? (
        <Dashboard profile={profile} />
      ) : isPremium ? (
        <Premium onSignOut={handleSignOut} profile={profile} />
      ) : isBrowse ? (
        <Browse />
      ) : isAuthPage ? (
        <Auth
          mode={isLogin ? 'login' : 'signup'}
          onSwitchMode={(nextMode) => navigate(nextMode === 'login' ? '/login' : '/signup')}
          onAuthSuccess={handleAuthSuccess}
        />
      ) : (
        <>
          <Hero onGetStarted={() => navigate('/signup')} />
          <About />
          <HowToUse />
          <Footer />
        </>
      )}
      <PremiumPopup profile={profile} />
    </div>
  );
}

export default App;
