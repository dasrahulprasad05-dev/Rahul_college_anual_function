// AuthContext.tsx
// Provides authentication state (user, roles, isAdmin, isVolunteer) to the entire app.
// Wraps Firebase Auth and fetches user from Firestore on every auth change.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
// TODO: Re-enable email service if needed: import { sendWelcomeIfFirstTime } from "@/services/email/resend";

type Role = "admin" | "volunteer" | "student";

// We adapt the User interface slightly for compatibility, Firebase user has .uid instead of .id
// Let's create an AppUser type that has .id
export interface AppUser extends User {
  id: string;
}

interface AuthCtx {
  user: AppUser | null;
  session: any | null; // Placeholder for compatibility
  roles: Role[];
  loading: boolean;
  isAdmin: boolean;
  isVolunteer: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // App compatibility mapping
        const appUser = firebaseUser as AppUser;
        appUser.id = firebaseUser.uid;
        setUser(appUser);
        setSession({ user: appUser }); // Mock session object

        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const role = data.role as Role;
            setRoles(role ? [role] : ["student"]);
          } else {
            setRoles(["student"]);
          }
        } catch (err) {
          console.error("Error fetching user roles:", err);
          setRoles(["student"]);
        }
      } else {
        setUser(null);
        setSession(null);
        setRoles([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthCtx = {
    user,
    session,
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isVolunteer: roles.includes("volunteer") || roles.includes("admin"),
    signOut: async () => {
      await firebaseSignOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
