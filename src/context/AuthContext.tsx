import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  updateUserProfile: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Test connection on mount
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  const loadUserProfile = async (uid: string, currentUser?: User) => {
    try {
      const profileRef = doc(db, 'profiles', uid);
      const snap = await getDoc(profileRef);

      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else if (currentUser) {
        // First-time user profile initialization
        const rawName = currentUser.displayName || 'Creator';
        const cleanUsername = (currentUser.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '') || `creator_${uid.slice(0, 5)}`).slice(0, 20);

        const newProfile: UserProfile = {
          userId: uid,
          displayName: rawName,
          username: cleanUsername,
          identityStatement: 'Creator & Maker documenting the process',
          bio: 'Passionate about building thoughtful work and sharing the journey, iterations, and lessons learned along the way.',
          avatarUrl: currentUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
          location: 'San Francisco, CA',
          websiteUrl: '',
          githubUrl: '',
          portfolioUrl: '',
          creatorType: 'Developer',
          currently: {
            exploring: 'Crafting intentional digital products',
            workingOn: 'A new creative project story',
            learning: 'Systems architecture & typography',
            openTo: 'Collaborative projects with designers and engineers',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(profileRef, newProfile);
        
        // Also write private contact info
        try {
          await setDoc(doc(db, 'users', uid, 'private', 'info'), {
            email: currentUser.email || '',
            createdAt: new Date().toISOString(),
          });
        } catch {
          // Non-blocking private record fallback
        }

        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser.uid, currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await loadUserProfile(result.user.uid, result.user);
      }
    } catch (error) {
      console.error('Google Sign-in Error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign-out Error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    const path = `profiles/${user.uid}`;
    try {
      const updated = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, 'profiles', user.uid), updated);
      setProfile((prev) => (prev ? { ...prev, ...updated } : null));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signOutUser,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
