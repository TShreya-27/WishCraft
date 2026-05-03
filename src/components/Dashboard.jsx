import React, {
  useEffect,
  useState
} from 'react';
import './Dashboard.css';
import {
  doc,
  getDoc
} from 'firebase/firestore';
import {
  auth,
  db
} from '../firebase.js';
import {
  onAuthStateChanged
} from 'firebase/auth';
function Dashboard({ profile: profileProp }) {

  const handleBrowse = () => {
    window.location.href = '/browse';
  };

  const handlePremium = () => {
    window.location.href = '/premium';
  };

  const handleTutorial = () => {
    window.location.href = '/tutorial';
  };

  const [userProfile, setUserProfile] =
    useState({
      name: profileProp?.name || 'User',
      picture: profileProp?.picture || '',
    });

const handleSignOut = () => {
  localStorage.clear();
  window.location.href = '/';
};

// =========================
// TEMPLATE STATE
// =========================

const [recommendedTemplates, setRecommendedTemplates] =
  useState([]);

// =========================
// LOAD TEMPLATE MAP
// =========================

useEffect(() => {

  async function loadTemplates() {

    try {

      const response =
        await fetch('/templateMap.json');

      const data =
        await response.json();

      const templates =
        data.flatMap((section) =>
          section.images.map((image, index) => ({
            id: `${section.title}-${index}-${image.src}`,
            name:
              image.name ||
              `${section.title} Template ${index + 1}`,
            category: section.title,
            image: image.src,
            premium: image.premium,
          }))
        );

      const randomTemplates =
        [...templates]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);

      setRecommendedTemplates(randomTemplates);

    } catch (err) {

      console.log(
        'Failed to load templates',
        err
      );
    }
  }
  loadTemplates();

},
 []);

 useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) return;

        try {
          const userRef =
            doc(db, 'users', user.uid);

          const snapshot =
            await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();

            const nextName =
              data?.name ||
              user.displayName ||
              'User';

            const nextPicture =
              data?.profilePic ||
              user.photoURL ||
              '';

            setUserProfile({
              name: nextName,
              picture: nextPicture,
            });

            localStorage.setItem(
              'wishcraft_profile_name',
              nextName
            );
            localStorage.setItem(
              'wishcraft_profile_picture',
              nextPicture
            );

            return;
          }
        } catch (err) {
          console.log(
            'Failed to fetch user profile:',
            err
          );
        }

        const fallbackName =
          user.displayName ||
          localStorage.getItem(
            'wishcraft_profile_name'
          ) ||
          'User';
        const fallbackPicture =
          user.photoURL ||
          localStorage.getItem(
            'wishcraft_profile_picture'
          ) ||
          '';

        setUserProfile({
          name: fallbackName,
          picture: fallbackPicture,
        });
      }
    );

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!profileProp) return;
  setUserProfile({
    name: profileProp.name || 'User',
    picture: profileProp.picture || '',
  });
}, [profileProp]);


  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <h1 className="dashboard-logo">
          WishCraft
        </h1>

    {/* USER */}

       <div className="dashboard-user">

  {userProfile?.picture ? (

    <img
      src={userProfile.picture}
      alt="User Profile"
      className="dashboard-user-image"
    />

  ) : (

    <div className="dashboard-user-circle">

      {userProfile?.name || 'User'}
      <br />
      Profile

    </div>
  )}

</div>


        {/* BUTTONS */}

        <div className="dashboard-sidebar-buttons">

          <button
            className="dashboard-btn"
            onClick={handlePremium}
          >
            Premium Plans
          </button>

          <button
            className="dashboard-browse-box"
            onClick={handleBrowse}
          >
            <span className="browse-big">
              Browse
            </span>

            <span className="browse-small">
              more
            </span>

            <div className="browse-categories">
              birthday | anniversary |
              festival | for loved ones
            </div>
          </button>

          <button
            className="dashboard-btn"
            onClick={handleTutorial}
          >
            Tutorial
          </button>

        </div>

        {/* SIGN OUT */}

        <button
          className="dashboard-signout"
          onClick={handleSignOut}
        >
          Sign Out
        </button>

      </aside>

      {/* MAIN CONTENT */}

      <main className="dashboard-main">

        <h1 className="dashboard-heading">
          Welcome back, {userProfile?.name || 'User'}!
        </h1>

        <h2 className="dashboard-subtitle">
          Recommended:
        </h2>

       {/* RECOMMENDED SECTION */}

<div className="dashboard-recommended">

  {recommendedTemplates
    .map((template) => {

      const isPremium =
        template.premium;

      return (

        <div
          key={template.id}
          className="recommended-template-card"
          onClick={() => {

            // PREMIUM

            if (isPremium) {

              window.location.href =
                '/premium';

              return;
            }

            // OPEN TEMPLATE

            localStorage.setItem(
              'selectedTemplate',
              template.image
            );

            window.location.href =
              '/edit';
          }}
        >
          {/* IMAGE */}

          <img
            src={template.image}
            alt={template.name}
            className="recommended-template-image"
          />

          {/* PREMIUM BADGE */}

          {isPremium && (
            <div className="recommended-premium-badge">
              <img src="/images/crown.png" alt="Premium" />
            </div>
          )}
             {/* TEMPLATE NAME */}
             <div className="recommended-template-category">
                {template.category}
             </div>

            </div>
          );
         })}

       </div>      

      </main>

    </div>
  );
}

export default Dashboard;
