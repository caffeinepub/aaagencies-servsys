import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Building2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileCode2,
  GitBranch,
  Headphones,
  Inbox,
  Key,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserCircle,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import type { User } from "../backend.d";
import { WelcomeModal } from "../components/WelcomeModal";
import GettingStartedPage from "./GettingStartedPage";

import ProfilePage from "./ProfilePage";
import MyRequests from "./dashboard/EndCustomer/MyRequests";
import Profile from "./dashboard/EndCustomer/Profile";
import ServicePortal from "./dashboard/EndCustomer/ServicePortal";
import AiAgents from "./dashboard/OrgAdmin/AiAgents";
import ApiKeys from "./dashboard/OrgAdmin/ApiKeys";
import BranchesSites from "./dashboard/OrgAdmin/BranchesSites";
import MyOrganization from "./dashboard/OrgAdmin/MyOrganization";
import OrgDashboard from "./dashboard/OrgAdmin/OrgDashboard";
import SubscriptionBilling from "./dashboard/OrgAdmin/SubscriptionBilling";
import TaskManagement from "./dashboard/OrgAdmin/TaskManagement";
import TeamInvites from "./dashboard/OrgAdmin/TeamInvites";
import WalletsFinance from "./dashboard/OrgAdmin/WalletsFinance";
import AllUsers from "./dashboard/SuperAdmin/AllUsers";
import ApiDocumentation from "./dashboard/SuperAdmin/ApiDocumentation";
import LeadAdmin from "./dashboard/SuperAdmin/LeadAdmin";
import Organizations from "./dashboard/SuperAdmin/Organizations";
import PlatformMetrics from "./dashboard/SuperAdmin/PlatformMetrics";
import PlatformOverview from "./dashboard/SuperAdmin/PlatformOverview";
import ActiveAgents from "./dashboard/TeamMember/ActiveAgents";
import MyTasks from "./dashboard/TeamMember/MyTasks";
import MyWallet from "./dashboard/TeamMember/MyWallet";
import AgentChatPage from "./dashboard/chat/AgentChatPage";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const SUPER_ADMIN_NAV: NavItem[] = [
  {
    id: "platform-overview",
    label: "Platform Overview",
    icon: LayoutDashboard,
  },
  { id: "organizations", label: "Organizations", icon: Building2 },
  { id: "all-users", label: "All Users", icon: Users },
  { id: "platform-metrics", label: "Platform Metrics", icon: BarChart3 },
  { id: "leads", label: "Leads", icon: Inbox },
  { id: "api-documentation", label: "API Documentation", icon: FileCode2 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "profile", label: "Profile", icon: UserCircle },
];

const ORG_ADMIN_NAV: NavItem[] = [
  { id: "org-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "my-organization", label: "My Organization", icon: Building2 },
  { id: "branches-sites", label: "Branches & Sites", icon: GitBranch },
  { id: "team-invites", label: "Team & Invites", icon: Users },
  { id: "wallets-finance", label: "Wallets & Finance", icon: Wallet },
  {
    id: "subscription-billing",
    label: "Subscription & Billing",
    icon: CreditCard,
  },
  { id: "ai-agents", label: "AI Agents", icon: Bot },
  { id: "task-management", label: "Task Management", icon: ListTodo },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "profile", label: "Profile", icon: UserCircle },
];

const TEAM_MEMBER_NAV: NavItem[] = [
  { id: "my-tasks", label: "My Tasks", icon: ClipboardList },
  { id: "active-agents", label: "Active Agents", icon: Bot },
  { id: "agent-chat", label: "Agent Chat", icon: MessageSquare },
  { id: "my-wallet", label: "My Wallet", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "profile", label: "Profile", icon: UserCircle },
];

const END_CUSTOMER_NAV: NavItem[] = [
  { id: "service-portal", label: "Service Portal", icon: Headphones },
  { id: "my-requests", label: "My Requests", icon: ClipboardList },
  { id: "agent-chat", label: "Agent Chat", icon: MessageSquare },
  { id: "customer-wallet", label: "My Wallet", icon: Wallet },
  { id: "profile", label: "Profile", icon: UserCircle },
];

function getNavForRole(role: string): NavItem[] {
  switch (role) {
    case "super_admin":
      return SUPER_ADMIN_NAV;
    case "org_admin":
      return ORG_ADMIN_NAV;
    case "team_member":
      return TEAM_MEMBER_NAV;
    case "end_customer":
      return END_CUSTOMER_NAV;
    default:
      return ORG_ADMIN_NAV;
  }
}

function getDefaultPage(role: string): string {
  switch (role) {
    case "super_admin":
      return "platform-overview";
    case "org_admin":
      return "org-dashboard";
    case "team_member":
      return "my-tasks";
    case "end_customer":
      return "service-portal";
    default:
      return "org-dashboard";
  }
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your preferences and account settings
        </p>
      </div>
      <div className="rounded-lg border border-border/60 p-8 text-center">
        <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">
          Settings panel coming in Phase 1B
        </p>
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  user: User;
  isNewUser?: boolean;
  onOnboardingComplete?: () => void;
}

export default function DashboardLayout({
  user,
  isNewUser = false,
  onOnboardingComplete,
}: DashboardLayoutProps) {
  const { clear } = useInternetIdentity();
  const role =
    typeof user.role === "object"
      ? Object.keys(user.role as object)[0]
      : String(user.role);
  const navItems = getNavForRole(role);
  const [activePage, setActivePage] = useState(
    isNewUser ? "getting-started" : getDefaultPage(role),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!!isNewUser);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    onOnboardingComplete?.();
  };

  const handleNavigate = (pageId: string) => {
    setActivePage(pageId);
    setSidebarOpen(false);
  };

  function renderPage(pageId: string) {
    switch (pageId) {
      case "getting-started":
        return <GettingStartedPage user={user} onNavigate={handleNavigate} />;
      case "platform-overview":
        return <PlatformOverview />;
      case "organizations":
        return <Organizations />;
      case "all-users":
        return <AllUsers />;
      case "platform-metrics":
        return <PlatformMetrics />;
      case "leads":
        return <LeadAdmin />;
      case "api-documentation":
        return <ApiDocumentation />;
      case "org-dashboard":
        return <OrgDashboard />;
      case "my-organization":
        return <MyOrganization />;
      case "branches-sites":
        return <BranchesSites />;
      case "team-invites":
        return <TeamInvites />;
      case "wallets-finance":
        return <WalletsFinance />;
      case "subscription-billing":
        return <SubscriptionBilling />;
      case "ai-agents":
        return <AiAgents />;
      case "task-management":
        return <TaskManagement />;
      case "api-keys":
        return <ApiKeys />;
      case "my-tasks":
        return <MyTasks />;
      case "active-agents":
        return <ActiveAgents />;
      case "agent-chat":
        return <AgentChatPage />;
      case "my-wallet":
        return <MyWallet />;
      case "customer-wallet":
        return <MyWallet />;
      case "service-portal":
        return <ServicePortal />;
      case "my-requests":
        return <MyRequests />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <PlatformOverview />;
    }
  }

  // Suppress unused import warnings — Profile is used by getDashboardRoute
  void Profile;

  const activeItem = navItems.find((n) => n.id === activePage);
  const activeLabel = activeItem?.label ?? "Getting Started";
  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Welcome modal for new users */}
      <WelcomeModal
        open={showWelcome}
        onClose={handleCloseWelcome}
        user={user}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-20 lg:hidden cursor-default w-full border-0 p-0"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-sidebar-border shrink-0">
          <div>
            <span className="font-display font-bold text-base text-sidebar-foreground">
              AAAgencies
            </span>
            <span className="text-primary font-display font-bold text-base">
              {" "}
              SerVSys
            </span>
          </div>
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  data-ocid={`nav.${item.id}.link`}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-60" />
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User + footer */}
        <div className="px-3 py-3 border-t border-sidebar-border shrink-0 space-y-1">
          <LanguageSwitcher className="w-full justify-start" />
          <Separator className="my-1" />
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {role.replace("_", " ")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 w-7 h-7"
              onClick={clear}
              title="Sign out"
              data-ocid="nav.logout.button"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/60 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display font-semibold text-base">
                {activeLabel}
              </h2>
            </div>
          </div>
        </header>

        {/* Page content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-7xl mx-auto">{renderPage(activePage)}</div>
        </ScrollArea>
      </main>
    </div>
  );
}
