import { Switch, Route, Redirect, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login"; // Using our new simpler login page
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Metrics from "@/pages/metrics";
import Reports from "@/pages/reports";
import DataCollection from "@/pages/data-collection";
import SdgAlignment from "@/pages/sdg-alignment";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import Layout from "./layout";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

function App() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user", { credentials: "include" });
        if (response.ok) {
          setIsAuthenticated(true);
          // If on login page and authenticated, redirect to dashboard
          if (location === "/login" || location === "/") {
            setLocation("/dashboard");
          }
        } else {
          setIsAuthenticated(false);
          // If not on login page and not authenticated, redirect to login
          if (location !== "/login" && location !== "/auth") {
            setLocation("/login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Switch>
        {/* Public routes */}
        <Route path="/login" component={Login} />
        
        {/* Default redirect */}
        <Route path="/">
          <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />
        </Route>
        
        {/* All protected routes */}
        <Route path="/:rest*">
          {!isAuthenticated ? (
            <Redirect to="/login" />
          ) : (
            <Layout>
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/projects" component={Projects} />
                <Route path="/metrics" component={Metrics} />
                <Route path="/reports" component={Reports} />
                <Route path="/data-collection" component={DataCollection} />
                <Route path="/sdg-alignment" component={SdgAlignment} />
                <Route path="/user-management" component={UserManagement} />
                <Route path="/settings" component={Settings} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          )}
        </Route>
      </Switch>
    </TooltipProvider>
  );
}

export default App;
