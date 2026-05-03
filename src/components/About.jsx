import React from 'react';

function About() {
  return (
    <section id="about" className="about">
      <div id="about-container" className="about-container">
        <div className="about-content">
          <div className="about-cards">
            <div className="card card-main">
              <h2 className="section-title">About</h2>
              <div className="card-header-row">
                <div className="card-header-images">
                  <img src="/images/greeting1.png" alt="greeting card 1" className="card-header-image card-header-image-primary" />
                  <img src="/images/greeting2.png" alt="greeting card 2" className="card-header-image card-header-image-secondary" />
                </div>
                <div className="card-header-copy">
                  <div className="card-header">
                    Craft Greetings That Feel Personal
                  </div>
                  <h3 className="card-title">WishCraft</h3>
                  <p className="card-description">
                    helps you turn simple wishes into<br /> meaningful digital greetings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-section">
            <div className="section-header">
              <div>How to use WishCraft?</div>
            </div>
            <img src="/images/howto.png" alt="how to use steps" className="section-header-image"/>
          </div>

          <div className="about-section premium-section">
            <div className="section-header premium-header">
              <span>Unlock Premium Creativity</span>
            </div>
            <div className="premium-content">
              <div className="premium-left">
                <img src="/images/premium.png" alt="premium users" className="premium-header-image" />
              </div>
              <div className="premium-right">
                <div className="premium-number">5</div>
                <div className="premium-benefits">
                  <h4>advantages of premium</h4>
                  <ul className="benefits-list">
                    <li>✓ Exclusive designer templates</li>
                    <li>✓ HD quality exports</li>
                    <li>✓ Watermark-free downloads</li>
                    <li>✓ Premium festive collections</li>
                    <li>✓ Advanced personalization styles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-card">
            <h2 className="footer-title">Craft. Share. Celebrate!</h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
