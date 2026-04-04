import { RoleBadge } from "@/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Building2,
  ClipboardList,
  FileCode2,
  GitBranch,
  Headphones,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import type { User } from "../backend.d";

function getDefaultPageForRole(role: string): string {
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

type StepCard = {
  icon: React.ElementType;
  title: string;
  description: string;
  pageId: string;
};

const SUPER_ADMIN_STEPS: StepCard[] = [
  {
    icon: BarChart3,
    title: "Explore the Platform",
    description:
      "View platform metrics and get a bird's-eye view of all organizations and users.",
    pageId: "platform-overview",
  },
  {
    icon: Building2,
    title: "Manage Organizations",
    description:
      "Create and configure organizations for your tenants and clients.",
    pageId: "organizations",
  },
  {
    icon: Users,
    title: "Review All Users",
    description: "See who's on the platform and manage their access and roles.",
    pageId: "all-users",
  },
  {
    icon: FileCode2,
    title: "Read the API Docs",
    description: "Explore all available APIs for integrations and automation.",
    pageId: "api-documentation",
  },
];

const ORG_ADMIN_STEPS: StepCard[] = [
  {
    icon: Building2,
    title: "Set Up Your Organization",
    description:
      "Fill in your organization profile, plan, and supported languages.",
    pageId: "my-organization",
  },
  {
    icon: Users,
    title: "Invite Your Team",
    description: "Create role-scoped invite links and grow your team.",
    pageId: "team-invites",
  },
  {
    icon: GitBranch,
    title: "Add Branches & Sites",
    description:
      "Organize your operations across locations and digital properties.",
    pageId: "branches-sites",
  },
  {
    icon: Bot,
    title: "Configure AI Agents",
    description:
      "Deploy and manage AI agents for your organization's workflows.",
    pageId: "ai-agents",
  },
];

const TEAM_MEMBER_STEPS: StepCard[] = [
  {
    icon: ClipboardList,
    title: "View Your Tasks",
    description: "See what's assigned to you and track progress.",
    pageId: "my-tasks",
  },
  {
    icon: Bot,
    title: "Meet Your Agents",
    description: "Explore the AI agents available in your workspace.",
    pageId: "active-agents",
  },
  {
    icon: Wallet,
    title: "Check Your Wallet",
    description: "Review your wallet balance and transaction history.",
    pageId: "my-wallet",
  },
];

const END_CUSTOMER_STEPS: StepCard[] = [
  {
    icon: Headphones,
    title: "Browse Services",
    description: "Explore available services and find what you need.",
    pageId: "service-portal",
  },
  {
    icon: ClipboardList,
    title: "Submit a Request",
    description: "Start your first service request and track its progress.",
    pageId: "my-requests",
  },
  {
    icon: Wallet,
    title: "Your Wallet",
    description: "Manage your payments and view your transaction history.",
    pageId: "customer-wallet",
  },
];

function getStepsForRole(role: string): StepCard[] {
  switch (role) {
    case "super_admin":
      return SUPER_ADMIN_STEPS;
    case "org_admin":
      return ORG_ADMIN_STEPS;
    case "team_member":
      return TEAM_MEMBER_STEPS;
    case "end_customer":
      return END_CUSTOMER_STEPS;
    default:
      return ORG_ADMIN_STEPS;
  }
}

interface GettingStartedPageProps {
  user: User;
  onNavigate: (pageId: string) => void;
}

export default function GettingStartedPage({
  user,
  onNavigate,
}: GettingStartedPageProps) {
  const role =
    typeof user.role === "object"
      ? Object.keys(user.role as object)[0]
      : String(user.role);

  const steps = getStepsForRole(role);
  const defaultPage = getDefaultPageForRole(role);

  return (
    <div className="space-y-8 pb-8" data-ocid="getting-started.page">
      {/* Header */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <RoleBadge role={role} />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Getting Started
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground leading-tight">
          Welcome to <span className="text-primary">AAAgencies SerVSys™</span>,{" "}
          <span className="text-foreground">{user.displayName}</span>!
        </h1>
        <p className="text-muted-foreground text-base max-w-xl">
          Here&#39;s how to get the most out of your new workspace.
        </p>
      </motion.div>

      {/* Step cards */}
      <div
        className={cn(
          "grid gap-4",
          steps.length >= 4
            ? "sm:grid-cols-2"
            : "sm:grid-cols-1 md:grid-cols-3",
        )}
      >
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.pageId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1 + i * 0.07,
                ease: "easeOut",
              }}
              data-ocid={`getting-started.item.${i + 1}`}
            >
              <Card
                className={cn(
                  "border-border/50 bg-card h-full transition-all duration-200",
                  "hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
                )}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/60 mt-1">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-semibold text-foreground text-sm">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10 font-medium text-xs group mt-1"
                    onClick={() => onNavigate(step.pageId)}
                    data-ocid={`getting-started.secondary_button.${i + 1}`}
                  >
                    Go →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <motion.div
        className="border border-border/40 rounded-xl p-6 bg-card/50 text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
      >
        <p className="text-base font-display font-semibold text-foreground">
          Ready to dive in?
        </p>
        <Button
          size="lg"
          className="gap-2 font-display font-semibold"
          onClick={() => onNavigate(defaultPage)}
          data-ocid="getting-started.primary_button"
        >
          Go to My Dashboard →
        </Button>
        <p className="text-xs text-muted-foreground">
          You can always return to this page from the sidebar.
        </p>
      </motion.div>
    </div>
  );
}
