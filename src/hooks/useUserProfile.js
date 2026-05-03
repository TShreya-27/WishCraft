import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function readCachedProfile() {
  return {
    uid: localStorage.getItem('wishcraft_uid') || '',
    type: localStorage.getItem('wishcraft_profile_type') || '',
    name: localStorage.getItem('wishcraft_profile_name') || 'User',
    picture: localStorage.getItem('wishcraft_profile_picture') || '',
    isPremium: localStorage.getItem('wishcraft_is_premium') === 'true',
  };
}

function cacheProfile(profile) {
  localStorage.setItem('wishcraft_uid', profile.uid || '');
  localStorage.setItem('wishcraft_profile_type', profile.type || 'local');
  localStorage.setItem('wishcraft_profile_name', profile.name || 'User');
  localStorage.setItem('wishcraft_profile_picture', profile.picture || '');
  localStorage.setItem('wishcraft_is_premium', profile.isPremium ? 'true' : 'false');
}

export function clearCachedProfile() {
  localStorage.removeItem('wishcraft_uid');
  localStorage.removeItem('wishcraft_profile_type');
  localStorage.removeItem('wishcraft_profile_name');
  localStorage.removeItem('wishcraft_profile_picture');
  localStorage.removeItem('wishcraft_is_premium');
}

export default function useUserProfile() {
  const [profile, setProfile] = useState(readCachedProfile());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthReady(true);
        setProfile({ uid: '', type: '', name: 'User', picture: '', isPremium: false });
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.exists() ? snap.data() : {};

        const next = {
          uid: user.uid,
          type: localStorage.getItem('wishcraft_profile_type') || 'local',
          name: data?.name || user.displayName || 'User',
          picture: data?.profilePic || user.photoURL || '',
          isPremium: Boolean(data?.isPremium || localStorage.getItem('wishcraft_is_premium') === 'true'),
        };

        cacheProfile(next);
        setProfile(next);
      } catch (error) {
        const fallback = {
          uid: user.uid,
          type: localStorage.getItem('wishcraft_profile_type') || 'local',
          name: user.displayName || localStorage.getItem('wishcraft_profile_name') || 'User',
          picture: user.photoURL || localStorage.getItem('wishcraft_profile_picture') || '',
          isPremium: localStorage.getItem('wishcraft_is_premium') === 'true',
        };
        cacheProfile(fallback);
        setProfile(fallback);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    profile,
    isAuthed: Boolean(profile.uid),
    authReady,
    setProfile,
  };
}
