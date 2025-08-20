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
    email,
    password,
  }: {
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user ?? null));

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      return supabase.auth.signUp({ email, password });
    },
    []
  );

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      return supabase.auth.signInWithPassword({ email, password });
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
