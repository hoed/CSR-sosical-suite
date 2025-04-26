import { createContext, ReactNode, useContext } from "react";

const AuthContext = createContext<any>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        isLoading: false,
        error: null,
        loginMutation: {
          mutate: () => {},
          isPending: false
        },
        logoutMutation: {
          mutate: () => {},
          isPending: false
        },
        registerMutation: {
          mutate: () => {},
          isPending: false
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useMockAuth must be used within a MockAuthProvider");
  }
  return context;
}