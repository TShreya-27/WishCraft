import React, { useState } from 'react';

function Premium({ onSignOut, profile }) {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'plans'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const isAuthed = Boolean(profile?.uid || localStorage.getItem('wishcraft_profile_type'));

  const handleGetOtp = () => {
    if (!email.trim()) {
      alert('Please enter a valid email');
      return;
    }
    // Dummy OTP - in real app, this would be sent
    alert(`OTP sent to ${email} (dummy: 123456)`);
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (!otp.trim() || otp.length < 4) {
      alert('Please enter a valid OTP (4-6 digits)');
      return;
    }
    // Dummy OTP verification
    alert('OTP verified!');
    setStep('plans');
  };

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setProcessingPayment(true);

    // Simulate payment processing (or free trial activation)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update localStorage for premium status
    localStorage.setItem('wishcraft_profile_type', 'premium');
    localStorage.setItem('wishcraft_is_premium', 'true');
    localStorage.setItem('wishcraft_premium_plan', plan);
    localStorage.setItem('wishcraft_premium_activated_at', new Date().toISOString());

    if (plan === 'free-trial') {
      alert('Free trial activated for 1 month!');
    } else {
      alert(`${plan} plan activated! (Dummy payment)`);
    }

    setProcessingPayment(false);
    window.history.pushState({}, '', '/dashboard');
    window.location.reload(); // Reload to update profile
  };

  const handleHomeClick = () => {
    const target = isAuthed ? '/dashboard' : '/';
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="premium-page">
      <div className="premium-container">
        {/* Left Panel - Email/OTP Verification */}
        <div className="premium-left">
          {step === 'email' && (
            <>
            <div className="premium-avatar">
              <div className="premium-avatar-bg">
                <img
                  src="/images/premiumplan.png"
                  alt="Premium Illustration"
                  className="premium-avatar-image"
                />
              </div>
            </div>
              <h2>Verify your Email</h2>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="premium-input"
                onKeyPress={(e) => e.key === 'Enter' && handleGetOtp()}
              />
              <button className="premium-btn" onClick={handleGetOtp}>
                Get OTP
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="premium-avatar">
                <div className="premium-avatar-bg">
                  <div className="avatar-circle">👤</div>
                </div>
              </div>
              <h2>Enter OTP</h2>
              <div className="otp-input-container">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="otp-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
                />
              </div>
              <button className="premium-btn" onClick={handleVerifyOtp}>
                Enter
              </button>
            </>
          )}

          {step === 'plans' && (
            <>
              <div className="premium-avatar">
                <div className="premium-avatar-bg">
                  <div className="avatar-circle">✓</div>
                </div>
              </div>
              <h2>Email Verified!</h2>
              <p style={{ color: '#fff', fontSize: '0.9em', marginTop: '10px' }}>
                Select a plan on the right to continue.
              </p>
            </>
          )}
        </div>

        {/* Right Panel - Premium Plans */}
        <div className="premium-right">
          <div className="plans-header">
            <h2 className="plans-title">Premium Plans</h2>
            <button type="button" className="premium-home-btn" onClick={handleHomeClick}>
              Home
            </button>
          </div>
          
          <div className="plans-grid">
            {/* Free Trial */}
            <div className={`plan-card ${selectedPlan === 'free-trial' ? 'selected' : ''}`}>
              <div className="plan-label">Try for Free</div>
              <div className="plan-price">₹0</div>
              <div className="plan-period">for 1 month</div>
              <button
                className="plan-action-btn premium-cta"
                onClick={() => handleSelectPlan('free-trial')}
                disabled={step !== 'plans' || processingPayment}
              >
                {processingPayment && selectedPlan === 'free-trial' ? 'Activating...' : 'Activate'}
              </button>
            </div>

            {/* Monthly Plans */}
            <div className={`plan-card ${selectedPlan === 'monthly' ? 'selected' : ''}`}>
              <div className="plan-label">Monthly Plans</div>
              <div className="plan-price">₹39</div>
              <div className="plan-period">/month</div>
              <button
                className="plan-action-btn"
                onClick={() => handleSelectPlan('monthly')}
                disabled={step !== 'plans' || processingPayment}
              >
                {processingPayment && selectedPlan === 'monthly' ? 'Processing...' : 'Select'}
              </button>
            </div>

            {/* Yearly Plans */}
            <div className={`plan-card ${selectedPlan === 'yearly' ? 'selected' : ''}`}>
              <div className="plan-label">Yearly Plans</div>
              <div className="plan-price">₹399</div>
              <div className="plan-period">/for a year</div>
              <button
                className="plan-action-btn"
                onClick={() => handleSelectPlan('yearly')}
                disabled={step !== 'plans' || processingPayment}
              >
                {processingPayment && selectedPlan === 'yearly' ? 'Processing...' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Premium;
