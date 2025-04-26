import { useState, useEffect } from 'react';

// Define user type
export interface User {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  role: string;
}

// Custom hook for authentication
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      // Get user data from the response
      const userData = await response.json();
      
      // Double check authentication by making a GET to /api/user
      try {
        const userCheckResponse = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (userCheckResponse.ok) {
          const verifiedUser = await userCheckResponse.json();
          console.log("User verified:", verifiedUser);
          setUser(verifiedUser);
          return verifiedUser;
        } else {
          console.error("Login succeeded but session validation failed");
          setUser(userData); // Fall back to using the login response
        }
      } catch (error) {
        console.error("Error verifying user session:", error);
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    role: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const user = await response.json();
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, login, logout, register };
}