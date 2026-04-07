import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ArrowLeft, Bot, Building2, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// Portal data
// ─────────────────────────────────────────────────────────────

const PORTAL_DATA = {
  a: {
    icon: Bot,
    eyebrow: "Portal A",
    name: "AI Agent Console",
    tagline: "Intelligent Automation at Your Fingertips",
    description:
      "The AI Agent Console is for end customers and team members who want to interact with AI-powered service agents, submit tasks, and track intelligent workflows. Whether you're a business user or an individual, this portal gives you direct access to multi-agent automation.",
    note: "Enter with Internet Identity \u2014 no passwords required.",
    accentColor: "#21C7B7",
    accentBg: "rgba(33,199,183,0.1)",
    accentBorder: "rgba(33,199,183,0.25)",
    audience: "End Customers & Team Members",
  },
  b: {
    icon: Building2,
    eyebrow: "Portal B",
    name: "Client & Agency Dashboard",
    tagline: "Run Your Entire Operation From One Place",
    description:
      "The Client & Agency Dashboard is for organization administrators and team members managing business operations. Create and manage your organization, invite team members, configure branches, manage wallets, and connect with the FinFracFran\u2122 financial framework.",
    note: "Designed for business owners, managers, and their crews.",
    accentColor: "#4B8EFF",
    accentBg: "rgba(75,142,255,0.1)",
    accentBorder: "rgba(75,142,255,0.25)",
    audience: "Org Admins & Team Members",
  },
  c: {
    icon: ShieldCheck,
    eyebrow: "Portal C",
    name: "Super Admin Console",
    tagline: "Full Platform Oversight & Control",
    description:
      "The Super Admin Console is for AAAgencies platform administrators only. Provision tenants, manage all organizations, configure platform-level settings, and oversee the entire SerVSys\u2122 infrastructure.",
    note: "Access is role-restricted and monitored.",
    accentColor: "#C8894A",
    accentBg: "rgba(200,137,74,0.1)",
    accentBorder: "rgba(200,137,74,0.25)",
    audience: "Platform Administrators Only",
  },
} as const;

type PortalId = keyof typeof PORTAL_DATA;

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface PortalInterstitialPageProps {
  portalId?: string;
}

export default function PortalInterstitialPage({
  portalId,
}: PortalInterstitialPageProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();

  // Normalize portal id
  const raw = portalId?.toLowerCase() ?? "b";
  const pid: PortalId = raw in PORTAL_DATA ? (raw as PortalId) : "b";
  const portal = PORTAL_DATA[pid];
  const Icon = portal.icon;

  const auroraAccentBg = portal.accentBg.replace("0.1", "0.15");
  const auroraBg = `radial-gradient(ellipse 60% 50% at 50% 40%, ${auroraAccentBg} 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 80% 70%, rgba(11,76,255,0.08) 0%, transparent 55%)`;

  // Ensure dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Redirect to main app when identity is available after login
  useEffect(() => {
    if (identity) {
      window.location.href = "/app";
    }
  }, [identity]);

  const handleBack = () => {
    window.location.href = "/home";
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#07131F", color: "#EAF2F8" }}
    >
      {/* Background aurora */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: auroraBg, filter: "blur(20px)" }}
      />

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          {/* Back link */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-70"
            style={{ color: "#A9B8C6" }}
            data-ocid="portal.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Card */}
          <div
            className="rounded-[20px] p-8 md:p-10"
            style={{
              backgroundColor: "#0B1E2C",
              border: `1px solid ${portal.accentBorder}`,
            }}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-6"
              style={{
                backgroundColor: portal.accentBg,
                border: `1px solid ${portal.accentBorder}`,
              }}
            >
              <Icon className="w-7 h-7" style={{ color: portal.accentColor }} />
            </div>

            {/* Eyebrow */}
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: portal.accentColor }}
            >
              {portal.eyebrow}
            </p>

            {/* Portal name */}
            <h1
              className="font-display font-bold text-2xl md:text-3xl mb-1"
              style={{ color: "#EAF2F8" }}
            >
              {portal.name}
            </h1>

            {/* Tagline */}
            <p
              className="font-medium text-base mb-5"
              style={{ color: portal.accentColor, opacity: 0.9 }}
            >
              {portal.tagline}
            </p>

            {/* Audience badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-6"
              style={{
                backgroundColor: portal.accentBg,
                border: `1px solid ${portal.accentBorder}`,
                color: portal.accentColor,
              }}
            >
              For: {portal.audience}
            </div>

            {/* Description */}
            <p
              className="text-sm leading-relaxed mb-2"
              style={{ color: "#A9B8C6", lineHeight: "1.7" }}
            >
              {portal.description}
            </p>
            <p
              className="text-xs italic mb-8"
              style={{ color: "#A9B8C6", opacity: 0.75 }}
            >
              {portal.note}
            </p>

            {/* Login CTA */}
            <Button
              className="w-full h-12 rounded-[10px] font-semibold text-sm"
              style={{
                backgroundColor: portal.accentColor,
                color: "#07131F",
              }}
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="portal.login_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Login to Enter"
              )}
            </Button>

            <p
              className="text-xs text-center mt-4"
              style={{ color: "#A9B8C6", opacity: 0.7 }}
            >
              Powered by Internet Identity \u2014 no passwords, no tracking.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-5">
        <p className="text-xs" style={{ color: "#A9B8C6", opacity: 0.6 }}>
          \u00a9 {new Date().getFullYear()} AAAgencies SerVSys\u2122 \u00b7
          Built with{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#A9B8C6" }}
            className="underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
