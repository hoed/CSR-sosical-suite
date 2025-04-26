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

// Create a simplified mock auth hook
export function useMockAuth() {
  return {
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
}

// Simple provider component that doesn't do anything special
export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}