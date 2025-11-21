import { Route, Switch } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { DeviceProvider } from "./contexts/DeviceContext";
import { DeveloperModeProvider } from "./contexts/DeveloperModeContext";
import { ProtectedRoute, PublicRoute } from "./components/routing";
import { AuthenticatedLayout } from "./components/layouts";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const AppContent: React.FC = () => {
  return (
    <IonRouterOutlet id="main">
      <Switch>
        {/* Public routes - login/register */}
        <Route exact path="/login">
          <PublicRoute>
            <Login />
          </PublicRoute>
        </Route>

        {/* All other routes are protected */}
        <Route path="/">
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        </Route>
      </Switch>
    </IonRouterOutlet>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <DeviceProvider>
          <DeveloperModeProvider>
            <IonReactRouter>
              <AppContent />
            </IonReactRouter>
          </DeveloperModeProvider>
        </DeviceProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
