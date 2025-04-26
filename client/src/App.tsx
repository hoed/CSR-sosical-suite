import { Switch, Route, Redirect, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Metrics from "@/pages/metrics";
import Reports from "@/pages/reports";
import DataCollection from "@/pages/data-collection";
import SdgAlignment from "@/pages/sdg-alignment";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import Layout from "./layout";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./auth";

function App() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    // Handle redirects based on authentication status
    if (!isLoading) {
      if (isAuthenticated) {
        // If authenticated and on login page, redirect to dashboard
        if (location === "/login" || location === "/") {
          console.log("User is authenticated, redirecting to dashboard");
          setTimeout(() => setLocation("/dashboard"), 100); // Small delay to ensure state has updated
        }
      } else {
        // If not authenticated and not on login page, redirect to login
        if (location !== "/login") {
          console.log("User is not authenticated, redirecting to login");
          setTimeout(() => setLocation("/login"), 100); // Small delay to ensure state has updated
        }
      }
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

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
