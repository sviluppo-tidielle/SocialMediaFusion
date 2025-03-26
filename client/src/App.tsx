import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Feed from "@/pages/Feed";
import Videos from "@/pages/Videos";
import Discover from "@/pages/Discover";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import EditProfile from "@/pages/EditProfile";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import StoriesCarousel from "@/components/StoriesCarousel";
import StoryViewer from "@/components/StoryViewer";
import CreateContentModal from "@/components/CreateContentModal";
import { TabProvider } from "@/hooks/use-tab";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <TabProvider>
      <Switch>
        <Route path="/auth" component={Auth} />
        <ProtectedRoute path="/" component={Feed} />
        <ProtectedRoute path="/videos" component={Videos} />
        <ProtectedRoute path="/discover" component={Discover} />
        <ProtectedRoute path="/profile" component={Profile} />
        <ProtectedRoute path="/edit-profile" component={EditProfile} />
        <Route component={NotFound} />
      </Switch>
    </TabProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
