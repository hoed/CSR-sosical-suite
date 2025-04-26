import React, { createContext, useContext } from "react";
import { User } from "@shared/schema";

// Mock user data
const mockUser: User = {
  id: 1,
  username: "admin",
  password: "hashed_password_placeholder",
  email: "admin@example.com",
  fullName: "Admin User",
  role: "admin",
  createdAt: new Date(),
  organizationId: 1
};

// Create mock auth context type
type MockAuthContextType = {
  user: User;
  isLoading: false;
  error: null;
  loginMutation: {
    mutateAsync: (credentials: any) => Promise<User>;
    isPending: boolean;
    isLoading: boolean;
  };
  logoutMutation: {
    mutateAsync: () => Promise<void>;
    isPending: boolean;
    isLoading: boolean;
  };
  registerMutation: {
    mutateAsync: (userData: any) => Promise<User>;
    isPending: boolean;
    isLoading: boolean;
  };
};

// Create the context with default value
const MockAuthContext = createContext<MockAuthContextType | null>(null);

// Create a hook to use the auth context
export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useMockAuth must be used within a MockAuthProvider");
  }
  return context;
}

// Create the provider component
export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  // Mock auth value that will be provided to consuming components
  const mockAuthValue: MockAuthContextType = {
    user: mockUser,
    isLoading: false,
    error: null,
    loginMutation: {
      mutateAsync: async () => mockUser,
      isPending: false,
      isLoading: false
    },
    logoutMutation: {
      mutateAsync: async () => {},
      isPending: false,
      isLoading: false
    },
    registerMutation: {
      mutateAsync: async (userData: any) => {
        const newUser = {
          ...userData,
          id: 2,
          password: "hashed_password_placeholder",
          createdAt: new Date(),
          organizationId: 1
        };
        return newUser;
      },
      isPending: false,
      isLoading: false
    }
  };

  return (
    <MockAuthContext.Provider value={mockAuthValue}>
      {children}
    </MockAuthContext.Provider>
  );
}