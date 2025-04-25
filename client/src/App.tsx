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

function App() {
  const [location] = useLocation();
  
  // Special handling for the auth page
  if (location === '/auth') {
    return (
      <TooltipProvider>
        <Switch>
          <Route path="/auth" component={AuthPage} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    );
  }
  
  // Protected routes wrapped in the Layout component
  return (
    <TooltipProvider>
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
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
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
