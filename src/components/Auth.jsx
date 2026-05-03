import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, googleProvider, db, storage } from '../firebase';

function Auth({ mode = 'signup', onSwitchMode, onAuthSuccess }) {
  const activeTab = mode;

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupPictureFile, setSignupPictureFile] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [guestOpen, setGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPicture, setGuestPicture] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const persistLocalProfile = (profile) => {
    localStorage.setItem('wishcraft_uid', profile.uid || '');
    localStorage.setItem('wishcraft_profile_type', profile.type || 'local');
    localStorage.setItem('wishcraft_profile_name', profile.name || 'User');
    localStorage.setItem('wishcraft_profile_picture', profile.profilePic || '');
    localStorage.setItem('wishcraft_is_premium', profile.isPremium ? 'true' : 'false');
  };

  const saveUserProfile = async (profile) => {
    await setDoc(doc(db, 'users', profile.uid), {
      uid: profile.uid,
      name: profile.name,
      email: profile.email || '',
      profilePic: profile.profilePic || '',
      isPremium: Boolean(profile.isPremium),
      type: profile.type || 'local',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  };

  const finalizeAuth = async (profile) => {
    await saveUserProfile(profile);
    persistLocalProfile(profile);
    localStorage.setItem('wishcraft_post_auth_redirect', '/dashboard');
    onAuthSuccess?.();
  };

  const handleSignupPictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSignupPictureFile(file);
  };

  const handleSignupEnter = async () => {
    if (!signupName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!signupEmail.trim()) {
      alert('Please enter your email.');
      return;
    }
    if (!signupPassword.trim()) {
      alert('Please create a password.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      alert('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword);
      const user = credential.user;

      let uploadedPhotoUrl = '';
      if (signupPictureFile) {
        const imageRef = ref(storage, `profiles/${user.uid}/${signupPictureFile.name}`);
        await uploadBytes(imageRef, signupPictureFile);
        uploadedPhotoUrl = await getDownloadURL(imageRef);
      }

      const displayName = signupName.trim() || user.displayName || 'User';
      const photoUrl = uploadedPhotoUrl || user.photoURL || '';

      await updateProfile(user, {
        displayName: displayName || null,
        photoURL: photoUrl || null,
      });

      await finalizeAuth({
        uid: user.uid,
        name: displayName,
        email: user.email || signupEmail.trim(),
        profilePic: photoUrl,
        isPremium: false,
        type: 'local',
      });
    } catch (error) {
      alert(error?.message || 'Sign up failed. Please check Firebase auth settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginEnter = async () => {
    if (!loginEmail.trim()) {
      alert('Please enter your email to login.');
      return;
    }
    if (!loginPassword.trim()) {
      alert('Please enter your password to login.');
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      const user = credential.user;
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const data = userSnap.exists() ? userSnap.data() : {};

      const profile = {
        uid: user.uid,
        name: data?.name || user.displayName || (loginEmail.split('@')[0] || 'User'),
        email: user.email || loginEmail.trim(),
        profilePic: data?.profilePic || user.photoURL || '',
        isPremium: Boolean(data?.isPremium),
        type: localStorage.getItem('wishcraft_profile_type') || 'local',
      };

      await finalizeAuth(profile);
    } catch (error) {
      alert(error?.message || 'Login failed. Check email/password and Firebase auth methods.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTo = (next) => {
    setGuestOpen(false);
    onSwitchMode?.(next);
  };

  const handleGuestPictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setGuestPicture(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const validateGuestProfile = () => {
    if (!guestName.trim()) {
      alert('Please enter your name.');
      return false;
    }
    if (!guestPicture) {
      alert('Please add a profile picture.');
      return false;
    }
    return true;
  };

  const runGuestFlow = async () => {
    if (!validateGuestProfile()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const credential = await signInAnonymously(auth);
      const user = credential.user;

      await updateProfile(user, {
        displayName: guestName.trim(),
        photoURL: guestPicture,
      });

      await finalizeAuth({
        uid: user.uid,
        name: guestName.trim(),
        email: user.email || '',
        profilePic: guestPicture,
        isPremium: false,
        type: 'guest',
      });
    } catch (error) {
      alert(error?.message || 'Guest sign-in failed. Check Firebase anonymous auth enablement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignupContinue = async () => {
    await runGuestFlow();
  };

  const handleGuestLoginContinue = async () => {
    await runGuestFlow();
  };

  const handleGoogleClick = async () => {
    setIsSubmitting(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const profile = {
        uid: user.uid,
        name: userData?.name || user.displayName || 'User',
        email: user.email || '',
        profilePic: userData?.profilePic || user.photoURL || '',
        isPremium: Boolean(userData?.isPremium),
        type: 'google',
      };

      await finalizeAuth(profile);
    } catch (error) {
      alert(error?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="signup" className="auth-section">
      <div className="auth-layout">
        <div className="auth-visual">
          <div className="auth-image-frame">
            <img src="/images/signin.png" alt="Crafting illustration" className="auth-main-image" />
          </div>
          <img src="/images/heart.png" alt="" className="auth-heart-line" />
        </div>

        <div className="auth-card" id="login">
          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => switchTo('login')}>
              Login
            </button>
            <button type="button" className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => switchTo('signup')}>
              Sign Up
            </button>
          </div>

          {activeTab === 'signup' ? (
            <form className="auth-form">
              <p className="auth-helper">Already have an account? <button type="button" className="auth-inline-link" onClick={() => switchTo('login')}>Login</button></p>
              <label className="auth-label" htmlFor="signup-name">User Name :</label>
              <input id="signup-name" type="text" className="auth-input" value={signupName} onChange={(e) => setSignupName(e.target.value)} />

              <label className="auth-label" htmlFor="signup-email">Email Address :</label>
              <input id="signup-email" type="email" className="auth-input" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />

              <label className="auth-label" htmlFor="signup-password">Create Password :</label>
              <input id="signup-password" type="password" className="auth-input" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />

              <label className="auth-label" htmlFor="signup-confirm">Confirm Password :</label>
              <input id="signup-confirm" type="password" className="auth-input" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} />

              <label className="auth-label" htmlFor="signup-picture">Profile Picture :</label>
              <input id="signup-picture" type="file" accept="image/*" className="auth-input auth-file" onChange={handleSignupPictureChange} />

              <button type="button" className="auth-action auth-enter" onClick={handleSignupEnter} disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : 'Enter'}
              </button>

              <div className="auth-divider">or</div>
              <button type="button" className="auth-action" onClick={handleGoogleClick} disabled={isSubmitting}>
                <img src="/images/google.png" alt="" aria-hidden="true" className="auth-action-icon" />
                Sign-in via Google
              </button>

              <div className="auth-divider">or</div>
              <button type="button" className="auth-action" onClick={() => setGuestOpen((v) => !v)} disabled={isSubmitting}>
                <img src="/images/guest.svg" alt="" aria-hidden="true" className="auth-action-icon" />
                Sign up as Guest
              </button>

              {guestOpen ? (
                <div className="auth-guest-panel">
                  <div className="auth-guest-title">Guest profile setup</div>

                  <label className="auth-label" htmlFor="guest-name">Name :</label>
                  <input id="guest-name" type="text" className="auth-input" value={guestName} onChange={(e) => setGuestName(e.target.value)} />

                  <label className="auth-label" htmlFor="guest-picture">Profile Picture :</label>
                  <input id="guest-picture" type="file" accept="image/*" className="auth-input auth-file" onChange={handleGuestPictureChange} />

                  {guestPicture ? (
                    <div className="auth-guest-preview-wrap">
                      <img src={guestPicture} alt="Guest profile" className="auth-guest-preview" />
                    </div>
                  ) : null}

                  <button type="button" className="auth-action auth-guest-continue" onClick={handleGuestSignupContinue} disabled={isSubmitting}>
                    {isSubmitting ? 'Please wait...' : 'Continue as Guest'}
                  </button>
                </div>
              ) : null}
            </form>
          ) : (
            <form className="auth-form">
              <p className="auth-helper">New here? <button type="button" className="auth-inline-link" onClick={() => switchTo('signup')}>Sign Up</button></p>
              <label className="auth-label" htmlFor="login-email">Email Address :</label>
              <input id="login-email" type="email" className="auth-input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />

              <label className="auth-label" htmlFor="login-password">Password :</label>
              <input id="login-password" type="password" className="auth-input" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

              <button type="button" className="auth-action auth-enter" onClick={handleLoginEnter} disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : 'Enter'}
              </button>

              <div className="auth-divider">or</div>
              <button type="button" className="auth-action" onClick={handleGoogleClick} disabled={isSubmitting}>
                <img src="/images/google.png" alt="" aria-hidden="true" className="auth-action-icon" />
                Login via Google
              </button>
              <div className="auth-divider">or</div>
              <button type="button" className="auth-action" onClick={() => setGuestOpen((v) => !v)} disabled={isSubmitting}>
                <img src="/images/guest.svg" alt="" aria-hidden="true" className="auth-action-icon" />
                Sign in as Guest
              </button>

              {guestOpen ? (
                <div className="auth-guest-panel">
                  <div className="auth-guest-title">Guest profile setup</div>

                  <label className="auth-label" htmlFor="guest-name">Name :</label>
                  <input id="guest-name" type="text" className="auth-input" value={guestName} onChange={(e) => setGuestName(e.target.value)} />

                  <label className="auth-label" htmlFor="guest-picture">Profile Picture :</label>
                  <input id="guest-picture" type="file" accept="image/*" className="auth-input auth-file" onChange={handleGuestPictureChange} />

                  {guestPicture ? (
                    <div className="auth-guest-preview-wrap">
                      <img src={guestPicture} alt="Guest profile" className="auth-guest-preview" />
                    </div>
                  ) : null}

                  <button type="button" className="auth-action auth-guest-continue" onClick={handleGuestLoginContinue} disabled={isSubmitting}>
                    {isSubmitting ? 'Please wait...' : 'Continue as Guest'}
                  </button>

                </div>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default Auth;
