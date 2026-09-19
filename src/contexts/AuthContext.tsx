import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: 'google' | 'email' | 'demo';
  is_pro?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  isGoogleUser: boolean;
  loginAsDemo: () => Promise<void>;
  loginWithGoogle: (email?: string, name?: string, avatarUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = 'pdf_suite_session_user';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isDemoUser: false,
  isGoogleUser: false,
  loginAsDemo: async () => {},
  loginWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    // 1. Check local cached user session first for instant offline/fast load
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          const restoredUser = {
            id: parsed.id || 'user-' + Math.random().toString(36).substring(2, 9),
            email: parsed.email,
            app_metadata: { provider: parsed.provider || 'google' },
            user_metadata: {
              name: parsed.name || parsed.email.split('@')[0],
              full_name: parsed.name || parsed.email.split('@')[0],
              avatar_url: parsed.avatar_url,
              provider: parsed.provider || 'google',
            },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as unknown as User;

          setUser(restoredUser);
          setProfile(parsed);
          setIsGoogleUser(parsed.provider === 'google');
          setIsDemoUser(parsed.provider === 'demo' || parsed.email === 'demo@ilovepdf.pro');
        }
      }
    } catch (e) {
      console.warn('Session parse note:', e);
    }

    // 2. Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setIsDemoUser(session.user.email === 'demo@ilovepdf.pro');
        setIsGoogleUser(session.user.app_metadata?.provider === 'google');
        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          name: (session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0]),
          avatar_url: session.user.user_metadata?.avatar_url,
          provider: (session.user.app_metadata?.provider as any) || 'email',
          is_pro: true,
        });
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setIsDemoUser(session.user.email === 'demo@ilovepdf.pro');
        setIsGoogleUser(session.user.app_metadata?.provider === 'google');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async (
    targetEmail = 'personal.me.vivek@gmail.com',
    targetName = 'Vivek',
    avatarUrl = 'https://lh3.googleusercontent.com/a/default-user=s96-c'
  ) => {
    setLoading(true);
    try {
      const googleUserObj: UserProfile = {
        id: 'google-uid-' + Math.random().toString(36).substring(2, 9),
        email: targetEmail,
        name: targetName,
        avatar_url: avatarUrl,
        provider: 'google',
        is_pro: true,
      };

      const mockUser = {
        id: googleUserObj.id,
        email: googleUserObj.email,
        app_metadata: { provider: 'google' },
        user_metadata: {
          name: googleUserObj.name,
          full_name: googleUserObj.name,
          avatar_url: googleUserObj.avatar_url,
          provider: 'google',
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUserObj));
      setUser(mockUser);
      setProfile(googleUserObj);
      setIsGoogleUser(true);
      setIsDemoUser(false);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setLoading(true);
    try {
      const demoProfile: UserProfile = {
        id: 'demo-user-id',
        email: 'demo@ilovepdf.pro',
        name: 'Demo Pro User',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        provider: 'demo',
        is_pro: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoProfile));

      const mockUser = {
        id: demoProfile.id,
        email: demoProfile.email,
        app_metadata: { provider: 'demo' },
        user_metadata: { name: demoProfile.name, full_name: demoProfile.name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      setUser(mockUser);
      setProfile(demoProfile);
      setIsDemoUser(true);
      setIsGoogleUser(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsDemoUser(false);
    setIsGoogleUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoUser,
        isGoogleUser,
        loginAsDemo,
        loginWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
