import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "./backend";
import type { User } from "./backend.d";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./pages/DashboardLayout";
import LaunchPage from "./pages/LaunchPage";
import PortalInterstitialPage from "./pages/PortalInterstitialPage";
import PublicLandingPage from "./pages/PublicLandingPage";

// Extended actor type for new backend methods not yet in generated types
interface ActorWithLastLogin {
  updateLastLogin(): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// Simple path-based router (no react-router-dom dependency)
// ─────────────────────────────────────────────────────────────

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handler = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return pathname;
}

// ─────────────────────────────────────────────────────────────
// Existing app logic (untouched)
// ─────────────────────────────────────────────────────────────

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor(createActor);
  const isAuthenticated = !!identity;
  const lastLoginFiredRef = useRef(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Check if user is registered
  const { data: isRegistered, isLoading: checkingRegistration } = useQuery({
    queryKey: ["isRegistered", identity?.getPrincipal().toString()],
    queryFn: () => actor!.isRegistered(),
    enabled: !!actor && isAuthenticated,
    retry: false,
  });

  // Get user profile if registered
  const { data: userProfile, isLoading: loadingProfile } = useQuery<User>({
    queryKey: ["my-profile", identity?.getPrincipal().toString()],
    queryFn: () => actor!.getMyProfile(),
    enabled: !!actor && isAuthenticated && !!isRegistered,
    retry: false,
  });

  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Fire-and-forget updateLastLogin once per session when user is confirmed registered
  useEffect(() => {
    if (isRegistered && actor && !lastLoginFiredRef.current) {
      lastLoginFiredRef.current = true;
      const extActor = actor as unknown as ActorWithLastLogin;
      extActor.updateLastLogin().catch(() => {
        // silently ignore errors -- non-critical telemetry
      });
    }
  }, [isRegistered, actor]);

  // Show loading spinner while initializing
  if (isInitializing || (isAuthenticated && checkingRegistration)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">
            Loading AAAgencies SerVSys...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -- show auth
  if (!isAuthenticated) {
    return (
      <AuthPage
        onRegistered={() => {
          setRegistrationComplete(true);
          setIsNewUser(true);
        }}
      />
    );
  }

  // Logged in but not registered -- show registration form
  if (isAuthenticated && !isRegistered && !registrationComplete) {
    return (
      <AuthPage
        onRegistered={() => {
          setRegistrationComplete(true);
          setIsNewUser(true);
        }}
      />
    );
  }

  // Registered but still loading profile
  if (
    isAuthenticated &&
    (isRegistered || registrationComplete) &&
    loadingProfile
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Fully authenticated and registered
  if (userProfile) {
    return (
      <DashboardLayout
        user={userProfile}
        isNewUser={isNewUser}
        onOnboardingComplete={() => setIsNewUser(false)}
      />
    );
  }

  // Fallback: show a demo dashboard with super_admin role for preview
  const demoUser: User = {
    principal: identity!.getPrincipal(),
    displayName: "Demo User",
    email: "demo@aaagencies.ai",
    role: { super_admin: null } as never,
    isActive: true,
    createdAt: BigInt(Date.now()),
    preferredLanguage: "en",
  };

  return (
    <DashboardLayout
      user={demoUser}
      isNewUser={isNewUser}
      onOnboardingComplete={() => setIsNewUser(false)}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Root App with lightweight path routing
// ─────────────────────────────────────────────────────────────

export default function App() {
  const pathname = usePathname();

  // Apply dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Route: / and /home → Public marketing landing page (wrapped in I18nProvider)
  if (pathname === "/" || pathname === "/home") {
    return (
      <I18nProvider>
        <PublicLandingPage />
        <Toaster richColors />
      </I18nProvider>
    );
  }

  // Route: /launch → Launch campaign page
  if (pathname === "/launch") {
    return (
      <>
        <LaunchPage />
        <Toaster richColors />
      </>
    );
  }

  // Route: /portal/:id (wrapped in I18nProvider so LanguageSwitcher works if added later)
  const portalMatch = pathname.match(/^\/portal\/([^/]+)$/);
  if (portalMatch) {
    return (
      <I18nProvider>
        <PortalInterstitialPage portalId={portalMatch[1]} />
        <Toaster richColors />
      </I18nProvider>
    );
  }

  // Route: /app (and sub-paths), /invite/:code → auth/dashboard shell
  if (
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname.startsWith("/invite/")
  ) {
    return (
      <>
        <AppContent />
        <Toaster richColors />
      </>
    );
  }

  // Default: unknown paths → public landing page
  return (
    <I18nProvider>
      <PublicLandingPage />
      <Toaster richColors />
    </I18nProvider>
  );
}
