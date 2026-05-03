import React, { useEffect, useState } from 'react';
import './PremiumPopup.css';

function PremiumPopup({ profile }) {

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {

    const type = profile?.type || localStorage.getItem('wishcraft_profile_type');
    const plan = localStorage.getItem('wishcraft_premium_plan');

    const premium =
      type === 'premium' ||
      plan === 'premium';

    if (premium) return;

    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5000);

    return () => clearTimeout(timer);

  }, [profile?.type]);

  if (!showPopup) return null;

  return (
    <div className="premium-popup">

      <button
        className="premium-popup-close"
        onClick={() => setShowPopup(false)}
      >
        ×
      </button>

      <img
        src="/images/gift.png"
        alt="Premium Gift"
        className="premium-popup-image"
      />

      <h2 className="premium-popup-title">
        Upgrade to
        <br />
        Premium for free
      </h2>

    </div>
  );
}

export default PremiumPopup;
