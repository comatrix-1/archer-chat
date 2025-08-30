import type {
  AuthResponse,
  AuthTokenResponsePassword,
} from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/utils/supabaseClient";
import type { TUser } from "~/types";

type TAuthContext = {
  user: TUser | null;
  signUp: ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResponse>;
  signIn: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<AuthTokenResponsePassword>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<TAuthContext>({
  user: null,
  signUp: () => Promise.reject(),
  signIn: () => Promise.reject(),
  signOut: () => Promise.reject(),
  loading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const authResponse = await supabase.auth.signUp({ email, password });
      console.log('authResponse: ', authResponse);
  
      if (authResponse.error) throw authResponse.error;
  
      const user = authResponse.data.user;
      if (user) {
        const { error: dbError } = await supabase
          .from('User')
          .insert({
            id: user.id,
            email: user.email,
            name,
          });
  
        if (dbError) {
          console.error('Error creating user profile in DB:', dbError);
        }
      }
  
      return authResponse;
    },
    []
  );
  
  

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const authResponse: AuthTokenResponsePassword = await supabase.auth.signInWithPassword({ email, password });
      if (authResponse.error) throw authResponse.error;

      return authResponse;
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const memoizedContext: TAuthContext = useMemo(
    () => ({
      user,
      signUp,
      signIn,
      signOut,
      loading,
    }),
    [user, signUp, signIn, signOut, loading]
  );

  return (
    <AuthContext.Provider value={memoizedContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
