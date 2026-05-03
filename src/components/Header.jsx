import React from 'react';

function Header({ onNavigate, isAuthed, profile }) {
  const nav = (event, to) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(to);
  };

  return (
    <header className="header">
      <div className="header-container">
        <nav className="navbar">
          <div className="nav-links">
            <a href={isAuthed ? '/dashboard' : '/'} className="nav-link" onClick={(e) => nav(e, isAuthed ? '/dashboard' : '/')}>Home</a>
            <a href="/#about-container" className="nav-link" onClick={(e) => nav(e, '/#about-container')}>About</a>
            <a href="/premium" className="nav-link get-premium" onClick={(e) => nav(e, '/premium')}>
              Get Premium
              <div className="crown-illustration">
                <img src="/images/crown.png" alt="premium" className="crown-image" />
              </div>
            </a>
            <a href="/login" className="nav-link" onClick={(e) => nav(e, '/login')}>Login</a>
            <a href="/signup" className="btn btn-signup" onClick={(e) => nav(e, '/signup')}>Sign Up</a>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
