import { Switch, Route, Redirect } from "wouter";
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
import AuthenticatedLayout from "./components/authenticated-layout";

// Temporary fix for auth issues - hardcode isAuthenticated to true
const isAuthenticated = true;

function App() {
  return (
    <TooltipProvider>
      <Switch>
        {/* Public routes */}
        <Route path="/login" component={Login} />
        
        {/* Default redirect */}
        <Route path="/">
          <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />
        </Route>
        
        {/* All protected routes - temporarily allowing access without auth check */}
        <Route path="/:rest*">
          <AuthenticatedLayout>
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
          </AuthenticatedLayout>
        </Route>
      </Switch>
    </TooltipProvider>
  );
}

export default App;
