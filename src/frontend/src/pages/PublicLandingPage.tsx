import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useTranslation } from "@/lib/i18n";
import { useMutation } from "@tanstack/react-query";
import {
  Bot,
  Building2,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

// ─────────────────────────────────────────────────────────────
// Actor type for lead submission
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

// ─────────────────────────────────────────────────────────────
// Lead Form (2C-ii enhanced version)
// ─────────────────────────────────────────────────────────────

function LeadForm() {
  const { actor, isFetching } = useActor();
  const { t, lang } = useTranslation();
  const leadActor = actor as unknown as ActorWithLead | null;
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    orgName: "",
    role: "",
    interest: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ROLE_OPTIONS = [
    { value: "individual", label: t("lead.form.role.individual") },
    { value: "agency", label: t("lead.form.role.agency") },
    { value: "enterprise", label: t("lead.form.role.enterprise") },
    { value: "developer", label: t("lead.form.role.developer") },
    { value: "partner", label: t("lead.form.role.partner") },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = t("lead.form.nameRequired");
    if (!form.email.trim()) {
      newErrors.email = t("lead.form.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t("lead.form.emailInvalid");
    }
    if (!form.role) newErrors.role = t("lead.form.roleRequired");
    if (!form.interest.trim())
      newErrors.interest = t("lead.form.interestRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!leadActor) throw new Error("Actor not ready");
      // Combine role + interest into the interest field since backend schema is unchanged
      const combinedInterest = form.role
        ? `[${form.role.toUpperCase()}] ${form.interest}`
        : form.interest;
      const result = await leadActor.submitLead({
        name: form.name,
        email: form.email,
        interest: combinedInterest,
        orgName: form.orgName || undefined,
        preferredLanguage: lang,
        source: "direct",
      });
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitMutation.mutate();
  };

  const inputCls =
    "bg-[#0B1E2C] border border-[#163244] text-[#EAF2F8] placeholder:text-[#A9B8C6]/60 rounded-[8px] focus:border-[#21C7B7]/60 focus:ring-[#21C7B7]/20 h-11";

  const errorCls = "text-xs mt-1";

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
          {t("lead.success.heading")}
        </h3>
        <p className="text-[#A9B8C6] text-sm text-center max-w-xs">
          {t("lead.success.body")}
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      data-ocid="lead.form"
      noValidate
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="lead-name" className="text-[#A9B8C6] text-sm">
          {t("lead.form.nameLbl")} <span className="text-[#C8894A]">*</span>
        </Label>
        <Input
          id="lead-name"
          placeholder={t("lead.form.namePlaceholder")}
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            if (errors.name) setErrors((er) => ({ ...er, name: "" }));
          }}
          className={inputCls}
          data-ocid="lead.input"
          autoComplete="name"
        />
        {errors.name && (
          <p className={errorCls} style={{ color: "#C8894A" }}>
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="lead-email" className="text-[#A9B8C6] text-sm">
          {t("lead.form.emailLbl")} <span className="text-[#C8894A]">*</span>
        </Label>
        <Input
          id="lead-email"
          type="email"
          placeholder={t("lead.form.emailPlaceholder")}
          value={form.email}
          onChange={(e) => {
            setForm((f) => ({ ...f, email: e.target.value }));
            if (errors.email) setErrors((er) => ({ ...er, email: "" }));
          }}
          className={inputCls}
          data-ocid="lead.input"
          autoComplete="email"
        />
        {errors.email && (
          <p className={errorCls} style={{ color: "#C8894A" }}>
            {errors.email}
          </p>
        )}
      </div>

      {/* Organization */}
      <div className="space-y-1.5">
        <Label htmlFor="lead-org" className="text-[#A9B8C6] text-sm">
          {t("lead.form.orgLbl")}{" "}
          <span className="text-[#A9B8C6]/60 font-normal">
            {t("lead.form.orgOptional")}
          </span>
        </Label>
        <Input
          id="lead-org"
          placeholder={t("lead.form.orgPlaceholder")}
          value={form.orgName}
          onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))}
          className={inputCls}
          data-ocid="lead.input"
          autoComplete="organization"
        />
      </div>

      {/* Role / Interest dropdown */}
      <div className="space-y-1.5">
        <Label htmlFor="lead-role" className="text-[#A9B8C6] text-sm">
          {t("lead.form.roleLbl")} <span className="text-[#C8894A]">*</span>
        </Label>
        <select
          id="lead-role"
          value={form.role}
          onChange={(e) => {
            setForm((f) => ({ ...f, role: e.target.value }));
            if (errors.role) setErrors((er) => ({ ...er, role: "" }));
          }}
          className={`${inputCls} w-full px-3 appearance-none`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A9B8C6' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
          }}
          data-ocid="lead.select"
        >
          <option
            value=""
            disabled
            style={{ backgroundColor: "#0B1E2C", color: "#A9B8C6" }}
          >
            {t("lead.form.rolePlaceholder")}
          </option>
          {ROLE_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ backgroundColor: "#0B1E2C", color: "#EAF2F8" }}
            >
              {opt.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className={errorCls} style={{ color: "#C8894A" }}>
            {errors.role}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="lead-interest" className="text-[#A9B8C6] text-sm">
          {t("lead.form.interestLbl")} <span className="text-[#C8894A]">*</span>
        </Label>
        <Textarea
          id="lead-interest"
          placeholder={t("lead.form.interestPlaceholder")}
          value={form.interest}
          onChange={(e) => {
            setForm((f) => ({ ...f, interest: e.target.value }));
            if (errors.interest) setErrors((er) => ({ ...er, interest: "" }));
          }}
          className={`${inputCls} h-24 resize-none`}
          data-ocid="lead.textarea"
        />
        {errors.interest && (
          <p className={errorCls} style={{ color: "#C8894A" }}>
            {errors.interest}
          </p>
        )}
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button
          type="submit"
          disabled={submitMutation.isPending}
          className="px-8 h-11 rounded-[8px] bg-[#E6EEF5] text-[#07131F] hover:bg-white font-semibold"
          data-ocid="lead.submit_button"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("lead.form.submitting")}
            </>
          ) : (
            t("lead.form.submit")
          )}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Partner logo placeholder data
// ─────────────────────────────────────────────────────────────

const PARTNER_SLOTS = [
  { name: "Innovate Labs" },
  { name: "NexGen AI" },
  { name: "FinTech Global" },
  { name: "AgileSys" },
  { name: "CloudBridge" },
  { name: "DataForge" },
];

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function PublicLandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useTranslation();

  const isRtl = lang === "ar";

  // Derived data (depends on translations)
  const PORTALS = [
    {
      id: "a" as const,
      icon: Bot,
      eyebrow: t("portals.a.eyebrow"),
      title: t("portals.a.title"),
      description: t("portals.a.description"),
      iconColor: "#21C7B7",
      iconBg: "rgba(33,199,183,0.12)",
    },
    {
      id: "b" as const,
      icon: Building2,
      eyebrow: t("portals.b.eyebrow"),
      title: t("portals.b.title"),
      description: t("portals.b.description"),
      iconColor: "#4B8EFF",
      iconBg: "rgba(75,142,255,0.12)",
    },
    {
      id: "c" as const,
      icon: ShieldCheck,
      eyebrow: t("portals.c.eyebrow"),
      title: t("portals.c.title"),
      description: t("portals.c.description"),
      iconColor: "#C8894A",
      iconBg: "rgba(200,137,74,0.12)",
    },
  ];

  const FEATURES = [
    { icon: Zap, label: t("features.multiAgentSwarms") },
    { icon: Bot, label: t("features.aiFirst") },
    { icon: Globe, label: t("features.multiLingual") },
    { icon: ShieldCheck, label: t("features.selfSovereign") },
  ];

  const SERVICE_ITEMS = [
    {
      eyebrow: t("services.agents.eyebrow"),
      title: t("services.agents.title"),
      description: t("services.agents.description"),
      bullets: [
        t("services.agents.bullet1"),
        t("services.agents.bullet2"),
        t("services.agents.bullet3"),
        t("services.agents.bullet4"),
      ],
      accentColor: "#21C7B7",
      accentBg: "rgba(33,199,183,0.10)",
      icon: Bot,
    },
    {
      eyebrow: t("services.servsys.eyebrow"),
      title: t("services.servsys.title"),
      description: t("services.servsys.description"),
      bullets: [
        t("services.servsys.bullet1"),
        t("services.servsys.bullet2"),
        t("services.servsys.bullet3"),
        t("services.servsys.bullet4"),
      ],
      accentColor: "#4B8EFF",
      accentBg: "rgba(75,142,255,0.10)",
      icon: Building2,
    },
    {
      eyebrow: t("services.finfracfran.eyebrow"),
      title: t("services.finfracfran.title"),
      description: t("services.finfracfran.description"),
      bullets: [
        t("services.finfracfran.bullet1"),
        t("services.finfracfran.bullet2"),
        t("services.finfracfran.bullet3"),
        t("services.finfracfran.bullet4"),
      ],
      accentColor: "#C8894A",
      accentBg: "rgba(200,137,74,0.10)",
      icon: Zap,
    },
  ];

  const PRICING_TIERS = [
    {
      name: t("pricing.free.name"),
      price: "$0",
      period: t("pricing.forever"),
      description: t("pricing.free.description"),
      features: [
        t("pricing.free.f1"),
        t("pricing.free.f2"),
        t("pricing.free.f3"),
        t("pricing.free.f4"),
        t("pricing.free.f5"),
      ],
      ctaLabel: t("pricing.free.cta"),
      ctaAction: "lead",
      accentColor: "#A9B8C6",
      accentBg: "rgba(169,184,198,0.10)",
      isRecommended: false,
    },
    {
      name: t("pricing.starter.name"),
      price: "$29",
      period: t("pricing.perMonth"),
      description: t("pricing.starter.description"),
      features: [
        t("pricing.starter.f1"),
        t("pricing.starter.f2"),
        t("pricing.starter.f3"),
        t("pricing.starter.f4"),
        t("pricing.starter.f5"),
        t("pricing.starter.f6"),
      ],
      ctaLabel: t("pricing.starter.cta"),
      ctaAction: "lead",
      accentColor: "#4B8EFF",
      accentBg: "rgba(75,142,255,0.10)",
      isRecommended: false,
    },
    {
      name: t("pricing.professional.name"),
      price: "$99",
      period: t("pricing.perMonth"),
      description: t("pricing.professional.description"),
      features: [
        t("pricing.professional.f1"),
        t("pricing.professional.f2"),
        t("pricing.professional.f3"),
        t("pricing.professional.f4"),
        t("pricing.professional.f5"),
        t("pricing.professional.f6"),
        t("pricing.professional.f7"),
        t("pricing.professional.f8"),
      ],
      ctaLabel: t("pricing.professional.cta"),
      ctaAction: "lead",
      accentColor: "#21C7B7",
      accentBg: "rgba(33,199,183,0.10)",
      isRecommended: true,
    },
    {
      name: t("pricing.enterprise.name"),
      price:
        t("pricing.enterprise.name") === "Enterprise"
          ? "Custom"
          : t("pricing.enterprise.name") === "Entreprise"
            ? "Sur mesure"
            : "Custom",
      period: "",
      description: t("pricing.enterprise.description"),
      features: [
        t("pricing.enterprise.f1"),
        t("pricing.enterprise.f2"),
        t("pricing.enterprise.f3"),
        t("pricing.enterprise.f4"),
        t("pricing.enterprise.f5"),
        t("pricing.enterprise.f6"),
        t("pricing.enterprise.f7"),
      ],
      ctaLabel: t("pricing.enterprise.cta"),
      ctaAction: "portal",
      accentColor: "#C8894A",
      accentBg: "rgba(200,137,74,0.10)",
      isRecommended: false,
    },
  ];

  const FOOTER_LINKS = [
    {
      heading: t("footer.platform"),
      links: [
        { label: t("footer.links.about") },
        { label: t("footer.links.services"), href: "#services" },
        { label: t("footer.links.apiDocs") },
        { label: t("footer.links.pricing"), href: "#pricing" },
      ],
    },
    {
      heading: t("footer.portals"),
      links: [
        { label: t("footer.links.aiAgentConsole") },
        { label: t("footer.links.agencyDashboard") },
        { label: t("footer.links.adminConsole") },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { label: t("footer.links.contact"), href: "#lead-capture" },
        { label: t("footer.links.blog") },
        { label: t("footer.links.careers") },
        { label: t("footer.links.press"), href: "#partner-press" },
      ],
    },
  ];

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
      dir={isRtl ? "rtl" : "ltr"}
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
              AAAgencies <span style={{ color: "#21C7B7" }}>SerVSys™</span>
            </span>
            <span className="text-[10px]" style={{ color: "#A9B8C6" }}>
              {t("nav.tagline")}
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
            {t("nav.login")}
          </Button>
          <Button
            size="sm"
            onClick={handleGetStarted}
            className="rounded-full bg-[#E6EEF5] text-[#07131F] hover:bg-white font-semibold h-8 px-4 text-xs"
            data-ocid="nav.primary_button"
          >
            {t("nav.getStarted")}
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
              {t("hero.badge")}
            </div>

            {/* H1 */}
            <h1
              className="font-display font-bold leading-[1.06] tracking-[-0.02em] mb-6"
              style={{ fontSize: "clamp(38px, 6vw, 60px)", color: "#EAF2F8" }}
            >
              {t("hero.h1_line1")} <br className="hidden md:block" />
              <span style={{ color: "#21C7B7" }}>{t("hero.h1_servsys")}</span>{" "}
              <br className="hidden md:block" />
              {t("hero.h1_with")}{" "}
              <span style={{ color: "#C8894A" }}>
                {t("hero.h1_finfracfran")}
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              className="mb-10 leading-relaxed max-w-2xl"
              style={{ fontSize: "17px", color: "#A9B8C6", lineHeight: "1.65" }}
            >
              {t("hero.subheadline")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGetStarted}
                className="rounded-full h-12 px-7 font-semibold text-sm bg-[#E6EEF5] text-[#07131F] hover:bg-white"
                data-ocid="hero.primary_button"
              >
                {t("hero.cta1")}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogin}
                className="rounded-full h-12 px-7 text-sm border-[#163244] bg-transparent text-[#A9B8C6] hover:text-[#EAF2F8] hover:bg-[#0B1E2C]"
                data-ocid="hero.secondary_button"
              >
                {t("hero.cta2")}
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
            {t("portals.heading")}
          </h2>
          <p style={{ color: "#A9B8C6", fontSize: "15px" }}>
            {t("portals.subheading")}
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
                {t("portals.enterPortal")}
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
            {t("services.badge")}
          </div>
          <h2
            className="font-display font-bold text-3xl md:text-4xl mb-3"
            style={{ color: "#EAF2F8" }}
          >
            {t("services.heading")}
          </h2>
          <p style={{ color: "#A9B8C6", fontSize: "15px", maxWidth: "560px" }}>
            {t("services.subheading")}
          </p>
        </motion.div>

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
            {t("pricing.badge")}
          </div>
          <h2
            className="font-display font-bold text-3xl md:text-4xl mb-3"
            style={{ color: "#EAF2F8" }}
          >
            {t("pricing.heading")}
          </h2>
          <p style={{ color: "#A9B8C6", fontSize: "15px", maxWidth: "560px" }}>
            {t("pricing.subheading")}
          </p>
        </motion.div>

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
              {tier.isRecommended && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: "#21C7B7",
                    color: "#07131F",
                  }}
                >
                  {t("pricing.recommended")}
                </div>
              )}

              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: tier.accentColor }}
              >
                {tier.name}
              </p>

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

              <p
                className="text-sm mt-2 mb-5"
                style={{ color: "#A9B8C6", lineHeight: "1.55" }}
              >
                {tier.description}
              </p>

              <div
                className="mb-5"
                style={{ borderTop: "1px solid #163244" }}
              />

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

              <div className="flex-1" />

              <button
                type="button"
                onClick={() => handlePricingCta(tier.ctaAction)}
                className="mt-6 w-full h-10 rounded-[8px] text-sm font-semibold transition-colors"
                style={
                  tier.isRecommended
                    ? { backgroundColor: "#21C7B7", color: "#07131F" }
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

      {/* ── Partners & Press ── */}
      <section
        id="partner-press"
        className="px-6 md:px-10 lg:px-16 py-24"
        aria-label="Partners and Press"
        data-ocid="partner.section"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Section header */}
          <div className="mb-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-medium"
              style={{
                backgroundColor: "rgba(33,199,183,0.1)",
                border: "1px solid rgba(33,199,183,0.25)",
                color: "#21C7B7",
              }}
            >
              Ecosystem
            </div>
            <h2
              className="font-display font-bold text-3xl md:text-4xl mb-3"
              style={{ color: "#EAF2F8" }}
            >
              Partners &amp; Press
            </h2>
            <p
              style={{ color: "#A9B8C6", fontSize: "15px", maxWidth: "560px" }}
            >
              We collaborate with forward-thinking organizations shaping the
              future of AI-powered services.
            </p>
          </div>

          {/* Two-column layout: partner grid left, press info right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Partner logos grid — takes 3 out of 5 columns on desktop */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                data-ocid="partner.list"
              >
                {PARTNER_SLOTS.map((partner, i) => (
                  <motion.div
                    key={partner.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.07,
                      ease: "easeOut",
                    }}
                    className="flex flex-col items-center gap-2 rounded-xl py-6 px-4 transition-colors cursor-default"
                    style={{
                      backgroundColor: "#091827",
                      border: "1px solid #163244",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(33,199,183,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#163244";
                    }}
                    data-ocid={`partner.item.${i + 1}`}
                  >
                    <Building2
                      className="w-7 h-7"
                      style={{ color: "#21C7B7" }}
                    />
                    <span
                      className="text-xs font-medium text-center leading-snug"
                      style={{ color: "#A9B8C6" }}
                    >
                      {partner.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Become a Partner CTA */}
              <div className="flex justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={handleScrollToLead}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-[8px] text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: "#21C7B7",
                    color: "#07131F",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2de0ce";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#21C7B7";
                  }}
                  data-ocid="partner.primary_button"
                >
                  <Building2 className="w-4 h-4" />
                  Become a Partner
                </button>
              </div>
            </div>

            {/* Press / Media card — takes 2 out of 5 columns on desktop */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                className="rounded-[16px] p-6 md:p-8 h-full flex flex-col gap-5"
                style={{
                  backgroundColor: "#091827",
                  border: "1px solid #163244",
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(33,199,183,0.10)",
                    border: "1px solid rgba(33,199,183,0.25)",
                  }}
                >
                  <Mail className="w-5 h-5" style={{ color: "#21C7B7" }} />
                </div>

                <div>
                  <h3
                    className="font-display font-bold text-xl mb-2"
                    style={{ color: "#EAF2F8" }}
                  >
                    Media &amp; Press
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#A9B8C6" }}
                  >
                    For press inquiries, partnership opportunities, and media
                    resources, reach out to our team.
                  </p>
                </div>

                <div
                  className="flex-1"
                  style={{
                    borderTop: "1px solid #163244",
                    paddingTop: "1.25rem",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "#A9B8C6" }}
                  >
                    Media Contact
                  </p>
                  <a
                    href="mailto:press@aaagencies.com"
                    className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ color: "#21C7B7" }}
                    data-ocid="partner.link"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    press@aaagencies.com
                  </a>
                </div>

                {/* Download press kit */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-[8px] text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #21C7B7",
                    color: "#21C7B7",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(33,199,183,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  data-ocid="partner.secondary_button"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Press Kit
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
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
              {t("lead.heading")}
            </h2>
            <p style={{ color: "#A9B8C6", fontSize: "15px" }}>
              {t("lead.subheading")}
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
                  AAAgencies <span style={{ color: "#21C7B7" }}>SerVSys™</span>
                </span>
              </div>
              <p
                className="text-sm leading-relaxed mb-5 max-w-xs"
                style={{ color: "#A9B8C6" }}
              >
                {t("footer.brand.description")}
              </p>
              <div className="space-y-1.5">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#21C7B7" }}
                >
                  {t("footer.brand.mission1")}
                </p>
                <p
                  className="text-xs font-medium italic"
                  style={{ color: "#A9B8C6" }}
                >
                  {t("footer.brand.mission2")}
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
              © {new Date().getFullYear()} {t("footer.copyright")}
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
