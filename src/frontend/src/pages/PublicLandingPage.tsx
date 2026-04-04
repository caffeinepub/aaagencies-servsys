import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useMutation } from "@tanstack/react-query";
import {
  Bot,
  Building2,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface PortalCard {
  id: "a" | "b" | "c";
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

const PORTALS: PortalCard[] = [
  {
    id: "a",
    icon: Bot,
    eyebrow: "Portal A",
    title: "AI Agent Console",
    description:
      "Access AI-powered agent swarms, task routing, and intelligent automation for your business.",
    iconColor: "#21C7B7",
    iconBg: "rgba(33,199,183,0.12)",
  },
  {
    id: "b",
    icon: Building2,
    eyebrow: "Portal B",
    title: "Client & Agency Dashboard",
    description:
      "Manage your organization, teams, branches, wallets, and vendor memberships.",
    iconColor: "#4B8EFF",
    iconBg: "rgba(75,142,255,0.12)",
  },
  {
    id: "c",
    icon: ShieldCheck,
    eyebrow: "Portal C",
    title: "Super Admin Console",
    description:
      "Platform-level controls, tenant provisioning, audit logs, and multi-org oversight.",
    iconColor: "#C8894A",
    iconBg: "rgba(200,137,74,0.12)",
  },
];

const FEATURES = [
  { icon: Zap, label: "Multi-Agent Swarms" },
  { icon: Bot, label: "AI-First Architecture" },
  { icon: Globe, label: "Multi-Lingual & Global" },
  { icon: ShieldCheck, label: "Self-Sovereign Identity" },
];

const SERVICE_ITEMS = [
  {
    eyebrow: "AI Agents",
    title: "Intelligent Multi-Agent Automation",
    description:
      "Deploy AI agent swarms that route tasks, automate workflows, and learn from your organization's data — across any language, region, or vertical.",
    bullets: [
      "Multi-agent task routing & orchestration",
      "Agent registry & lifecycle management",
      "Real-time automation across departments",
      "Pluggable AI models & custom logic",
    ],
    accentColor: "#21C7B7",
    accentBg: "rgba(33,199,183,0.10)",
    icon: Bot,
  },
  {
    eyebrow: "SerVSys\u2122",
    title: "Service as a System",
    description:
      "A unified platform for multi-org, multi-vendor, multi-site, and multi-user service delivery. Run your entire agency ecosystem from a single control plane.",
    bullets: [
      "Multi-tenant organization management",
      "Branch & site provisioning",
      "Multi-vendor & multi-wallet support",
      "Role-scoped access across all teams",
    ],
    accentColor: "#4B8EFF",
    accentBg: "rgba(75,142,255,0.10)",
    icon: Building2,
  },
  {
    eyebrow: "FinFracFran\u2122",
    title: "Financial Fractionalization & Franchising",
    description:
      "The FinFracFran\u2122 framework modernizes asset ownership and wealth distribution — enabling fractional ownership, franchise models, and equitable earnings for everyone.",
    bullets: [
      "Fractional asset ownership & tokenization",
      "Franchise licensing & royalty flows",
      "Equitable wealth distribution models",
      "Multi-wallet & payment-rail ready",
    ],
    accentColor: "#C8894A",
    accentBg: "rgba(200,137,74,0.10)",
    icon: Zap,
  },
];

const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore the platform with no commitment.",
    features: [
      "1 organization",
      "Up to 3 users",
      "1 AI agent slot",
      "Basic task management",
      "Community support",
    ],
    ctaLabel: "Get Started Free",
    ctaAction: "lead",
    accentColor: "#A9B8C6",
    accentBg: "rgba(169,184,198,0.10)",
    isRecommended: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/ month",
    description: "For small teams and growing agencies.",
    features: [
      "3 organizations",
      "Up to 20 users",
      "5 AI agent slots",
      "Invite link onboarding",
      "Multi-wallet support",
      "Email support",
    ],
    ctaLabel: "Request Early Access",
    ctaAction: "lead",
    accentColor: "#4B8EFF",
    accentBg: "rgba(75,142,255,0.10)",
    isRecommended: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/ month",
    description: "Full-featured for established agencies.",
    features: [
      "Unlimited organizations",
      "Unlimited users",
      "25 AI agent slots",
      "SerVSys\u2122 multi-site ops",
      "FinFracFran\u2122 framework",
      "Branch & vendor management",
      "Priority support",
      "API access",
    ],
    ctaLabel: "Get Professional",
    ctaAction: "lead",
    accentColor: "#21C7B7",
    accentBg: "rgba(33,199,183,0.10)",
    isRecommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored for large-scale, multi-tenant deployments.",
    features: [
      "Unlimited everything",
      "White-label options",
      "Dedicated PaaS tenant",
      "Custom AI agent quota",
      "SLA & compliance",
      "Dedicated account manager",
      "Webhook & audit log access",
    ],
    ctaLabel: "Contact Sales",
    ctaAction: "portal",
    accentColor: "#C8894A",
    accentBg: "rgba(200,137,74,0.10)",
    isRecommended: false,
  },
];

// Footer links with optional href overrides
const FOOTER_LINKS = [
  {
    heading: "Platform",
    links: [
      { label: "About" },
      { label: "Services", href: "#services" },
      { label: "API Docs" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Portals",
    links: [
      { label: "AI Agent Console" },
      { label: "Agency Dashboard" },
      { label: "Admin Console" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact" },
      { label: "Blog" },
      { label: "Careers" },
      { label: "Press" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Lead Form
// ─────────────────────────────────────────────────────────────

interface ActorWithLead {
  submitLead(input: {
    name: string;
    email: string;
    interest: string;
    orgName?: string;
    preferredLanguage: string;
    source: string;
  }): Promise<
    { __kind__: "ok"; ok: unknown } | { __kind__: "err"; err: string }
  >;
}

function LeadForm() {
  const { actor, isFetching } = useActor();
  const leadActor = actor as unknown as ActorWithLead | null;
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    orgName: "",
    interest: "",
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!leadActor) throw new Error("Actor not ready");
      const lang = localStorage.getItem("preferred_language") ?? "en";
      const result = await leadActor.submitLead({
        name: form.name,
        email: form.email,
        interest: form.interest,
        orgName: form.orgName || undefined,
        preferredLanguage: lang,
        source: "direct",
      });
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Thanks! We'll be in touch soon.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const inputCls =
    "bg-[#0B1E2C] border border-[#163244] text-[#EAF2F8] placeholder:text-[#A9B8C6]/60 rounded-[8px] focus:border-[#21C7B7]/60 focus:ring-[#21C7B7]/20 h-11";

  if (isFetching) {
    return (
      <div
        className="flex items-center justify-center py-12"
        data-ocid="lead.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#21C7B7]" />
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-12"
        data-ocid="lead.success_state"
      >
        <div className="w-16 h-16 rounded-full bg-[#21C7B7]/15 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#21C7B7]" />
        </div>
        <h3 className="font-display text-xl font-semibold text-[#EAF2F8]">
          You're on the list!
        </h3>
        <p className="text-[#A9B8C6] text-sm text-center max-w-xs">
          We'll reach out soon with early access details. Welcome to the
          AAAgencies community.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitMutation.mutate();
      }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      data-ocid="lead.form"
    >
      <div className="space-y-1.5">
        <Label htmlFor="lead-name" className="text-[#A9B8C6] text-sm">
          Name <span className="text-[#C8894A]">*</span>
        </Label>
        <Input
          id="lead-name"
          required
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputCls}
          data-ocid="lead.input"
          autoComplete="name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-email" className="text-[#A9B8C6] text-sm">
          Email <span className="text-[#C8894A]">*</span>
        </Label>
        <Input
          id="lead-email"
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputCls}
          data-ocid="lead.input"
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-org" className="text-[#A9B8C6] text-sm">
          Organization{" "}
          <span className="text-[#A9B8C6]/60 font-normal">(optional)</span>
        </Label>
        <Input
          id="lead-org"
          placeholder="Your company or org name"
          value={form.orgName}
          onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))}
          className={inputCls}
          data-ocid="lead.input"
          autoComplete="organization"
        />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="lead-interest" className="text-[#A9B8C6] text-sm">
          Message / Interest <span className="text-[#C8894A]">*</span>
        </Label>
        <Textarea
          id="lead-interest"
          required
          placeholder="Tell us what you're looking to build or explore..."
          value={form.interest}
          onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
          className={`${inputCls} h-24 resize-none`}
          data-ocid="lead.textarea"
        />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button
          type="submit"
          disabled={
            submitMutation.isPending ||
            !form.name ||
            !form.email ||
            !form.interest
          }
          className="px-8 h-11 rounded-[8px] bg-[#E6EEF5] text-[#07131F] hover:bg-white font-semibold"
          data-ocid="lead.submit_button"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Request Early Access"
          )}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function PublicLandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Ensure dark mode on public page
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.title = "AAAgencies SerVSys\u2122 \u2014 Ours Empowers YOurs";
  }, []);

  const handlePortalNav = (portalId: string) => {
    window.location.href = `/portal/${portalId}`;
  };

  const handleLogin = () => {
    window.location.href = "/app";
  };

  const handleGetStarted = () => {
    document.getElementById("portals")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToLead = () => {
    document
      .getElementById("lead-capture")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePricingCta = (ctaAction: string) => {
    if (ctaAction === "lead") {
      handleScrollToLead();
    } else if (ctaAction === "portal") {
      window.location.href = "/portal/b";
    }
  };

  const auroraBlobs =
    "radial-gradient(ellipse 70% 60% at 30% 40%, rgba(11,76,255,0.22) 0%, transparent 60%), " +
    "radial-gradient(ellipse 55% 50% at 65% 35%, rgba(33,199,183,0.18) 0%, transparent 55%), " +
    "radial-gradient(ellipse 45% 40% at 80% 70%, rgba(200,137,74,0.14) 0%, transparent 50%)";

  const auroraDeep =
    "radial-gradient(ellipse 40% 30% at 15% 75%, rgba(11,76,255,0.10) 0%, transparent 60%), " +
    "radial-gradient(ellipse 35% 35% at 90% 20%, rgba(33,199,183,0.08) 0%, transparent 60%)";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#07131F", color: "#EAF2F8" }}
    >
      {/* ── Sticky Nav ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-3"
        style={{
          backgroundColor: "rgba(7,19,31,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(22,50,68,0.6)",
        }}
        data-ocid="nav.section"
      >
        {/* Logo + wordmark */}
        <a
          href="/home"
          className="flex items-center gap-3"
          data-ocid="nav.link"
        >
          <img
            src="/assets/generated/aaagencies-logo-transparent.dim_200x200.png"
            alt="AAAgencies SerVSys logo"
            className="w-9 h-9 object-contain"
          />
          <div className="leading-tight hidden sm:block">
            <span className="font-display font-bold text-base text-[#EAF2F8] block leading-none">
              AAAgencies <span style={{ color: "#21C7B7" }}>SerVSys\u2122</span>
            </span>
            <span className="text-[10px]" style={{ color: "#A9B8C6" }}>
              Ours Empowers YOurs
            </span>
          </div>
        </a>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="text-[#A9B8C6] hover:text-[#EAF2F8]" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogin}
            className="hidden sm:inline-flex rounded-full border-[#163244] bg-transparent text-[#A9B8C6] hover:text-[#EAF2F8] hover:bg-[#0B1E2C] h-8 px-4 text-xs"
            data-ocid="nav.login_button"
          >
            Login
          </Button>
          <Button
            size="sm"
            onClick={handleGetStarted}
            className="rounded-full bg-[#E6EEF5] text-[#07131F] hover:bg-white font-semibold h-8 px-4 text-xs"
            data-ocid="nav.primary_button"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center px-6 md:px-10 lg:px-16 pt-16 pb-24"
        aria-label="Hero"
      >
        {/* Aurora gradient blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: auroraBlobs }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: auroraDeep, filter: "blur(32px)" }}
        />

        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-xs font-medium"
              style={{
                backgroundColor: "rgba(33,199,183,0.1)",
                border: "1px solid rgba(33,199,183,0.25)",
                color: "#21C7B7",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#21C7B7" }}
              />
              AI Agents & Agencies as a Service
            </div>

            {/* H1 */}
            <h1
              className="font-display font-bold leading-[1.06] tracking-[-0.02em] mb-6"
              style={{ fontSize: "clamp(38px, 6vw, 60px)", color: "#EAF2F8" }}
            >
              The Future of Work is <br className="hidden md:block" />
              <span style={{ color: "#21C7B7" }}>SerVSys\u2122</span> Powered{" "}
              <br className="hidden md:block" />
              with <span style={{ color: "#C8894A" }}>FinFracFran\u2122</span>
            </h1>

            {/* Sub-headline */}
            <p
              className="mb-10 leading-relaxed max-w-2xl"
              style={{ fontSize: "17px", color: "#A9B8C6", lineHeight: "1.65" }}
            >
              An AI-driven, multi-tenant platform for multi-agent operations,
              financial fractionalization, and equitable wealth distribution.
              Built for individuals, teams, and enterprises worldwide.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGetStarted}
                className="rounded-full h-12 px-7 font-semibold text-sm bg-[#E6EEF5] text-[#07131F] hover:bg-white"
                data-ocid="hero.primary_button"
              >
                Explore Portals
              </Button>
              <Button
                variant="outline"
                onClick={handleLogin}
                className="rounded-full h-12 px-7 text-sm border-[#163244] bg-transparent text-[#A9B8C6] hover:text-[#EAF2F8] hover:bg-[#0B1E2C]"
                data-ocid="hero.secondary_button"
              >
                Login to Dashboard
              </Button>
            </div>
          </motion.div>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25, ease: "easeOut" }}
            className="flex flex-wrap gap-3 mt-14"
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs"
                style={{
                  backgroundColor: "rgba(11,30,44,0.7)",
                  border: "1px solid rgba(22,50,68,0.8)",
                  color: "#A9B8C6",
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: "#21C7B7" }} />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Portal Cards ── */}
      <section
        id="portals"
        className="px-6 md:px-10 lg:px-16 pb-24"
        aria-label="Entry Portals"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-10"
        >
          <h2
            className="font-display font-bold text-3xl mb-3"
            style={{ color: "#EAF2F8" }}
          >
            Choose Your Portal
          </h2>
          <p style={{ color: "#A9B8C6", fontSize: "15px" }}>
            Three purpose-built entry points \u2014 each tailored to a different
            role in the SerVSys\u2122 ecosystem.
          </p>
        </motion.div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          data-ocid="portals.list"
        >
          {PORTALS.map((portal, i) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="flex flex-col rounded-[16px] p-6"
              style={{
                backgroundColor: "#0B1E2C",
                border: "1px solid #163244",
              }}
              data-ocid={`portals.item.${i + 1}`}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4"
                style={{
                  backgroundColor: portal.iconBg,
                  border: `1px solid ${portal.iconColor}40`,
                }}
              >
                <portal.icon
                  className="w-5 h-5"
                  style={{ color: portal.iconColor }}
                />
              </div>

              {/* Text stack */}
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: portal.iconColor }}
              >
                {portal.eyebrow}
              </p>
              <h3
                className="font-display font-semibold text-lg mb-2"
                style={{ color: "#EAF2F8" }}
              >
                {portal.title}
              </h3>
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: "#A9B8C6", lineHeight: "1.6" }}
              >
                {portal.description}
              </p>

              {/* CTA */}
              <button
                type="button"
                onClick={() => handlePortalNav(portal.id)}
                className="mt-5 flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: portal.iconColor }}
                data-ocid={`portals.enter_button.${i + 1}`}
              >
                Enter Portal
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Services Showcase ── */}
      <section
        id="services"
        className="px-6 md:px-10 lg:px-16 pb-24"
        aria-label="Platform Services"
        data-ocid="services.section"
      >
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-medium"
            style={{
              backgroundColor: "rgba(33,199,183,0.1)",
              border: "1px solid rgba(33,199,183,0.25)",
              color: "#21C7B7",
            }}
          >
            Platform Services
          </div>
          <h2
            className="font-display font-bold text-3xl md:text-4xl mb-3"
            style={{ color: "#EAF2F8" }}
          >
            Everything Your Agency Needs
          </h2>
          <p style={{ color: "#A9B8C6", fontSize: "15px", maxWidth: "560px" }}>
            Three interconnected systems \u2014 AI, Operations, and Finance
            \u2014 designed to work as one.
          </p>
        </motion.div>

        {/* Service cards */}
        <div className="flex flex-col gap-5" data-ocid="services.list">
          {SERVICE_ITEMS.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.eyebrow}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.12,
                  ease: "easeOut",
                }}
                className="flex flex-col md:flex-row gap-6 rounded-[16px] p-6 md:p-8"
                style={{
                  backgroundColor: "#0B1E2C",
                  border: "1px solid #163244",
                }}
                data-ocid={`services.item.${i + 1}`}
              >
                {/* Icon badge */}
                <div className="flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: service.accentBg,
                      border: `1px solid ${service.accentColor}40`,
                    }}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: service.accentColor }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: service.accentColor }}
                  >
                    {service.eyebrow}
                  </p>
                  <h3
                    className="font-display font-bold text-xl md:text-2xl mb-3"
                    style={{ color: "#EAF2F8" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: "#A9B8C6" }}
                  >
                    {service.description}
                  </p>

                  {/* Bullet chips */}
                  <div className="flex flex-wrap gap-2">
                    {service.bullets.map((bullet) => (
                      <span
                        key={bullet}
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: service.accentBg,
                          color: service.accentColor,
                          border: `1px solid ${service.accentColor}30`,
                        }}
                      >
                        {bullet}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Pricing Tiers ── */}
      <section
        id="pricing"
        className="px-6 md:px-10 lg:px-16 pb-24"
        aria-label="Pricing"
        data-ocid="pricing.section"
      >
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-medium"
            style={{
              backgroundColor: "rgba(33,199,183,0.1)",
              border: "1px solid rgba(33,199,183,0.25)",
              color: "#21C7B7",
            }}
          >
            Pricing
          </div>
          <h2
            className="font-display font-bold text-3xl md:text-4xl mb-3"
            style={{ color: "#EAF2F8" }}
          >
            Plans for Every Scale
          </h2>
          <p style={{ color: "#A9B8C6", fontSize: "15px", maxWidth: "560px" }}>
            From solo explorers to global enterprises \u2014 SerVSys\u2122
            scales with you.
          </p>
        </motion.div>

        {/* Pricing cards grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          data-ocid="pricing.list"
        >
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="relative flex flex-col rounded-[16px] p-6"
              style={{
                backgroundColor: "#0B1E2C",
                border: tier.isRecommended
                  ? "1px solid #21C7B7"
                  : "1px solid #163244",
                boxShadow: tier.isRecommended
                  ? "0 0 20px rgba(33,199,183,0.18)"
                  : "none",
              }}
              data-ocid={`pricing.item.${i + 1}`}
            >
              {/* Recommended badge */}
              {tier.isRecommended && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: "#21C7B7",
                    color: "#07131F",
                  }}
                >
                  Recommended
                </div>
              )}

              {/* Tier name eyebrow */}
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: tier.accentColor }}
              >
                {tier.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-1">
                <span
                  className="text-4xl font-bold leading-none"
                  style={{ color: "#EAF2F8" }}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm" style={{ color: "#A9B8C6" }}>
                    {tier.period}
                  </span>
                )}
              </div>

              {/* Description */}
              <p
                className="text-sm mt-2 mb-5"
                style={{ color: "#A9B8C6", lineHeight: "1.55" }}
              >
                {tier.description}
              </p>

              {/* Divider */}
              <div
                className="mb-5"
                style={{ borderTop: "1px solid #163244" }}
              />

              {/* Feature list */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: "#A9B8C6" }}
                  >
                    <Check
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: tier.accentColor }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Spacer */}
              <div className="flex-1" />

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => handlePricingCta(tier.ctaAction)}
                className="mt-6 w-full h-10 rounded-[8px] text-sm font-semibold transition-colors"
                style={
                  tier.isRecommended
                    ? {
                        backgroundColor: "#21C7B7",
                        color: "#07131F",
                      }
                    : {
                        backgroundColor: "transparent",
                        border: `1px solid ${tier.accentColor}`,
                        color: tier.accentColor,
                      }
                }
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  if (tier.isRecommended) {
                    el.style.backgroundColor = "#2de0ce";
                  } else {
                    el.style.backgroundColor = tier.accentBg;
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  if (tier.isRecommended) {
                    el.style.backgroundColor = "#21C7B7";
                  } else {
                    el.style.backgroundColor = "transparent";
                  }
                }}
                data-ocid={`pricing.primary_button.${i + 1}`}
              >
                {tier.ctaLabel}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Lead Capture ── */}
      <section
        id="lead-capture"
        className="px-6 md:px-10 lg:px-16 pb-24"
        aria-label="Early Access"
        data-ocid="lead.section"
      >
        <div
          className="max-w-3xl mx-auto rounded-[20px] p-8 md:p-12"
          style={{ backgroundColor: "#091827", border: "1px solid #163244" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <h2
              className="font-display font-bold text-3xl mb-3"
              style={{ color: "#EAF2F8" }}
            >
              Get Early Access
            </h2>
            <p style={{ color: "#A9B8C6", fontSize: "15px" }}>
              Be among the first to experience the full SerVSys\u2122 platform.
              Share your interest and we'll reach out with priority onboarding.
            </p>
          </motion.div>

          <LeadForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 md:px-10 lg:px-16 py-14"
        style={{ borderTop: "1px solid #163244" }}
        aria-label="Footer"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/assets/generated/aaagencies-logo-transparent.dim_200x200.png"
                  alt="AAAgencies SerVSys logo"
                  className="w-8 h-8 object-contain"
                />
                <span
                  className="font-display font-bold text-base"
                  style={{ color: "#EAF2F8" }}
                >
                  AAAgencies{" "}
                  <span style={{ color: "#21C7B7" }}>SerVSys\u2122</span>
                </span>
              </div>
              <p
                className="text-sm leading-relaxed mb-5 max-w-xs"
                style={{ color: "#A9B8C6" }}
              >
                AI Agents & Agencies as a Service. Transforming how
                organizations operate through intelligent automation and
                financial fractionalization.
              </p>
              <div className="space-y-1.5">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#21C7B7" }}
                >
                  You Be Your Best
                </p>
                <p
                  className="text-xs font-medium italic"
                  style={{ color: "#A9B8C6" }}
                >
                  Self Sovereign Always & In All Ways
                </p>
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading}>
                <h4
                  className="font-semibold text-xs uppercase tracking-wider mb-4"
                  style={{ color: "#A9B8C6" }}
                >
                  {col.heading}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <a
                          href={link.href}
                          className="text-sm transition-opacity hover:opacity-80"
                          style={{ color: "#A9B8C6" }}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="text-sm transition-opacity hover:opacity-80 text-left"
                          style={{ color: "#A9B8C6" }}
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid #163244" }}
          >
            <p className="text-xs" style={{ color: "#A9B8C6" }}>
              \u00a9 {new Date().getFullYear()} AAAgencies SerVSys\u2122. All
              rights reserved. FinFracFran\u2122 Framework.
            </p>
            <p className="text-xs" style={{ color: "#A9B8C6" }}>
              Built with{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
