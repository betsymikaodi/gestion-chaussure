import * as React from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile, createUserProfile } from '@/lib/supabase';

type AuthResponse = {
  error: Error | null;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = profile?.is_admin || false;

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user?.id) return null;
    return await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfile(data.session.user.id);
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { 
        error: error instanceof Error ? error : new Error('An unknown error occurred') 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('Auth error:', error);
        return { error };
      }

      if (data.user) {
        try {
          await createUserProfile({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            phone: null,
            is_admin: false
          });
          
          // Si l'email doit être confirmé, on ne connecte pas automatiquement
          if (data.session) {
            // L'utilisateur est déjà connecté (confirmation d'email désactivée)
            setSession(data.session);
            setUser(data.session.user);
            await fetchProfile(data.session.user.id);
            return { error: null };
          } else {
            // L'email doit être confirmé
            return { 
              error: new Error('Please check your email to confirm your account before signing in.') 
            };
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          return { 
            error: profileError instanceof Error 
              ? profileError 
              : new Error('Failed to create user profile') 
          };
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { 
        error: error instanceof Error ? error : new Error('An unknown error occurred') 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { 
        error: error instanceof Error ? error : new Error('Failed to sign out') 
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { 
        error: error instanceof Error ? error : new Error('Failed to reset password') 
      };
    }
  };

  // Gestion des changements d'état d'authentification
  useEffect(() => {
    // Vérifier la session active au chargement
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const value = {
    session,
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
