import React, { Suspense } from "react";
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonSpinner,
} from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import { list, settings, camera, people, mailOutline } from "ionicons/icons";
import { lazy } from "react";

// Lazy load page components
const Devices = lazy(() => import("../../pages/Devices"));
const DeviceDiscovery = lazy(() => import("../../pages/DeviceDiscovery"));
const ColorPalette = lazy(() => import("../../pages/ColorPalette"));
const PaletteCreator = lazy(() => import("../../pages/PaletteCreator"));
const Friends = lazy(() => import("../../pages/Friends"));
const Messages = lazy(() => import("../../pages/Messages"));
const Settings = lazy(() => import("../../pages/Settings"));

/**
 * Layout component for authenticated users
 * Contains the main tab navigation and routing
 */
export const AuthenticatedLayout: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <IonSpinner name="crescent" />
            </div>
          }
        >
          <Route exact path="/devices">
            <Devices />
          </Route>
          <Route exact path="/devices/discover">
            <DeviceDiscovery />
          </Route>
          <Route exact path="/palette">
            <ColorPalette />
          </Route>
          <Route exact path="/create">
            <PaletteCreator />
          </Route>
          <Route exact path="/friends">
            <Friends />
          </Route>
          <Route exact path="/messages">
            <Messages />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
        </Suspense>
        <Route exact path="/">
          <Redirect to="/devices" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="devices" href="/devices">
          <IonIcon aria-hidden="true" icon={list} />
          <IonLabel>Devices</IonLabel>
        </IonTabButton>
        <IonTabButton tab="messages" href="/messages">
          <IonIcon aria-hidden="true" icon={mailOutline} />
          <IonLabel>Messages</IonLabel>
        </IonTabButton>
        <IonTabButton tab="create" href="/create">
          <IonIcon aria-hidden="true" icon={camera} />
          <IonLabel>Create</IonLabel>
        </IonTabButton>
        <IonTabButton tab="friends" href="/friends">
          <IonIcon aria-hidden="true" icon={people} />
          <IonLabel>Friends</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/settings">
          <IonIcon aria-hidden="true" icon={settings} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
