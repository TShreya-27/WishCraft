import React from 'react';

function Hero({ onGetStarted }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Welcome to <span className="brand">WishCraft</span></h1>
        <button type="button" className="btn btn-primary btn-lg" onClick={onGetStarted}>
          Get Started <span className="arrow">→</span>
        </button>
      </div>
      <div className="hero-illustration">
        <img src="/images/crafts-illustration.png" alt="Crafting supplies illustration" className="crafts-image" />
      </div>
    </section>
  );
}

export default Hero;
