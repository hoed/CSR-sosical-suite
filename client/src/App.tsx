import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import Layout from "./layout";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Metrics from "@/pages/metrics";
import Reports from "@/pages/reports";
import DataCollection from "@/pages/data-collection";
import SdgAlignment from "@/pages/sdg-alignment";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  
  // Special handling for auth page
  if (location === '/auth') {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }
  
  return (
    <Layout>
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/projects" component={Projects} />
        <ProtectedRoute path="/metrics" component={Metrics} />
        <ProtectedRoute path="/reports" component={Reports} />
        <ProtectedRoute path="/data-collection" component={DataCollection} />
        <ProtectedRoute path="/sdg-alignment" component={SdgAlignment} />
        <ProtectedRoute path="/user-management" component={UserManagement} />
        <ProtectedRoute path="/settings" component={Settings} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
