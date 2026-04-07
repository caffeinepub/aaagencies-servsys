import { useActor } from "@caffeineai/core-infrastructure";
import {
  Bot,
  Copy,
  Linkedin,
  Loader2,
  Shield,
  Twitter,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";

// ─────────────────────────────────────────────────────────────
// Actor interface for LaunchPage
// ─────────────────────────────────────────────────────────────

interface ActorWithLaunch {
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
  getPlatformSettings(): Promise<
    | {
        __kind__: "ok";
        ok: {
          launchDate?: bigint;
          announcementBanner?: string;
          announcementBannerEnabled: boolean;
        };
      }
    | { __kind__: "err"; err: string }
  >;
}

// ─────────────────────────────────────────────────────────────
// Shared colour tokens (matches PublicLandingPage)
// ─────────────────────────────────────────────────────────────

const COLORS = {
  bg: "#060F1A",
  card: "#091827",
  cardBorder: "#163244",
  accent: "#21C7B7",
  accentDim: "rgba(33,199,183,0.1)",
  accentBorder: "rgba(33,199,183,0.25)",
  heading: "#EAF2F8",
  body: "#A9B8C6",
  muted: "#4D6478",
};

// ─────────────────────────────────────────────────────────────
// Countdown logic
// ─────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: "12px",
        padding: "20px 24px",
        minWidth: "80px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 800,
          color: COLORS.accent,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: COLORS.muted,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginTop: "6px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Countdown({ launchDateMs }: { launchDateMs: number | null }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    launchDateMs !== null ? calcTimeLeft(launchDateMs) : null,
  );

  useEffect(() => {
    if (launchDateMs === null) return;
    const tick = () => setTimeLeft(calcTimeLeft(launchDateMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [launchDateMs]);

  if (!timeLeft) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: COLORS.accent,
            animation: "pulse 1.8s ease-in-out infinite",
          }}
        />
        <span
          style={{
            color: COLORS.heading,
            fontSize: "1.5rem",
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
          }}
        >
          Coming Soon
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <CountdownBox value={timeLeft.days} label="Days" />
      <CountdownBox value={timeLeft.hours} label="Hours" />
      <CountdownBox value={timeLeft.minutes} label="Minutes" />
      <CountdownBox value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Early Access Form
// ─────────────────────────────────────────────────────────────

const ROLES = [
  { value: "Individual", label: "Individual" },
  { value: "Agency", label: "Agency" },
  { value: "Enterprise", label: "Enterprise" },
  { value: "Developer", label: "Developer" },
  { value: "Partner", label: "Partner" },
];

function EarlyAccessForm() {
  const { actor } = useActor(createActor);
  const typedActor = actor as unknown as ActorWithLaunch | null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Individual");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedActor) return;
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await typedActor.submitLead({
        name: name.trim(),
        email: email.trim(),
        interest: `[LAUNCH_EARLY_ACCESS] ${role}`,
        preferredLanguage: "en",
        source: "/launch",
      });
      if ("__kind__" in res && res.__kind__ === "ok") {
        setSubmitted(true);
      } else {
        const msg = "err" in res ? res.err : "Submission failed";
        setError(msg);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(9,24,39,0.8)",
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: "8px",
    color: COLORS.heading,
    padding: "10px 14px",
    fontSize: "0.875rem",
    width: "100%",
    outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234D6478' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "40px",
    cursor: "pointer",
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.accentBorder}`,
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          maxWidth: "480px",
          margin: "0 auto",
        }}
        data-ocid="launch.success_state"
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: COLORS.accentDim,
            border: `1px solid ${COLORS.accentBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg
            aria-label="Check mark"
            role="img"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3
          style={{
            color: COLORS.heading,
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "8px",
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}
        >
          You're on the list!
        </h3>
        <p style={{ color: COLORS.body, fontSize: "0.9rem" }}>
          We'll notify you at launch. Get ready to build the future.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: "16px",
        padding: "32px",
        maxWidth: "480px",
        margin: "0 auto",
        width: "100%",
      }}
      data-ocid="launch.form"
    >
      <h3
        style={{
          color: COLORS.heading,
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "20px",
          fontFamily: "'Bricolage Grotesque', sans-serif",
        }}
      >
        Claim Your Early Access Spot
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          data-ocid="launch.input"
          autoComplete="name"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          data-ocid="launch.input"
          autoComplete="email"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={selectStyle}
          data-ocid="launch.select"
        >
          {ROLES.map((r) => (
            <option
              key={r.value}
              value={r.value}
              style={{ backgroundColor: COLORS.card }}
            >
              {r.label}
            </option>
          ))}
        </select>

        {error && (
          <p
            style={{ color: "#F87171", fontSize: "0.8rem" }}
            data-ocid="launch.error_state"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !typedActor}
          style={{
            backgroundColor: submitting
              ? "rgba(33,199,183,0.6)"
              : COLORS.accent,
            color: "#060F1A",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "background-color 0.2s",
            width: "100%",
          }}
          data-ocid="launch.submit_button"
          onMouseEnter={(e) => {
            if (!submitting)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#2DE0CE";
          }}
          onMouseLeave={(e) => {
            if (!submitting)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                COLORS.accent;
          }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Submitting..." : "Claim Your Spot →"}
        </button>
      </div>
    </motion.form>
  );
}

// ─────────────────────────────────────────────────────────────
// Feature Highlights
// ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Bot,
    title: "Multi-Agent Orchestration",
    desc: "Deploy intelligent agents that work together across your entire organization.",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    desc: "Multi-tenant, multi-role platform built for teams, agencies, and enterprises at any scale.",
  },
  {
    icon: Shield,
    title: "Own Your Stack",
    desc: "Powered by the Internet Computer — your data, your keys, your platform. Always sovereign.",
  },
];

function FeatureCards() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "20px",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * i }}
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: "14px",
            padding: "28px 24px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              backgroundColor: COLORS.accentDim,
              border: `1px solid ${COLORS.accentBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <f.icon size={20} color={COLORS.accent} />
          </div>
          <h3
            style={{
              color: COLORS.heading,
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "8px",
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            {f.title}
          </h3>
          <p
            style={{
              color: COLORS.body,
              fontSize: "0.875rem",
              lineHeight: 1.6,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {f.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Social Share
// ─────────────────────────────────────────────────────────────

const LAUNCH_URL = "https://aaa.io/launch";

function SocialShare() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LAUNCH_URL);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const iconBtnStyle: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: "8px",
    color: COLORS.body,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "border-color 0.2s, color 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "40px 0",
      }}
    >
      <p
        style={{
          color: COLORS.muted,
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Share the launch →
      </p>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href={`https://twitter.com/intent/tweet?text=I%20just%20claimed%20early%20access%20to%20AAAgencies%20SerVSys%E2%84%A2%20%E2%80%94%20the%20AI-native%20agency%20platform.%20Join%20me!&url=${encodeURIComponent(LAUNCH_URL)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={iconBtnStyle}
          data-ocid="launch.button"
        >
          <Twitter size={16} />
          Share on X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(LAUNCH_URL)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={iconBtnStyle}
          data-ocid="launch.button"
        >
          <Linkedin size={16} />
          Share on LinkedIn
        </a>
        <button
          type="button"
          onClick={handleCopy}
          style={iconBtnStyle}
          data-ocid="launch.button"
        >
          <Copy size={16} />
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LaunchPage
// ─────────────────────────────────────────────────────────────

export default function LaunchPage() {
  const { actor } = useActor(createActor);
  const typedActor = actor as unknown as ActorWithLaunch | null;
  const [launchDateMs, setLaunchDateMs] = useState<number | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || !typedActor) return;
    fetchedRef.current = true;
    typedActor
      .getPlatformSettings()
      .then((res) => {
        if ("__kind__" in res && res.__kind__ === "ok") {
          const ld = res.ok.launchDate;
          if (ld !== undefined && ld !== null) {
            // launchDate is stored as nanoseconds in Motoko
            setLaunchDateMs(Number(ld) / 1_000_000);
          }
        }
      })
      .catch(() => {
        // non-critical — keep "Coming Soon" state
      });
  }, [typedActor]);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        color: COLORS.body,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      data-ocid="launch.page"
    >
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      {/* ── Topbar ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(6,15,26,0.9)",
          backdropFilter: "blur(12px)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: "1.1rem",
            color: COLORS.heading,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: COLORS.accent }}>AAA</span>gencies{" "}
          <span style={{ color: COLORS.muted, fontWeight: 400 }}>SerVSys™</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: COLORS.body,
            cursor: "pointer",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            padding: "6px 0",
          }}
          data-ocid="launch.link"
        >
          <span>←</span> Back to site
        </button>
      </header>

      {/* ── Hero ── */}
      <main>
        <section
          style={{
            minHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "80px 24px 60px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {/* Tag badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: COLORS.accentDim,
              border: `1px solid ${COLORS.accentBorder}`,
              borderRadius: "999px",
              padding: "6px 16px",
              fontSize: "0.8rem",
              color: COLORS.accent,
              fontWeight: 600,
              marginBottom: "32px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: COLORS.accent,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            Early Access · Limited Spots
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              color: COLORS.heading,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "20px",
            }}
          >
            The Future of{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${COLORS.accent}, #7CEAE0)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI-Powered
            </span>{" "}
            Agencies
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              color: COLORS.body,
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              lineHeight: 1.7,
              maxWidth: "620px",
              marginBottom: "48px",
            }}
          >
            Join thousands of forward-thinking teams building with SerVSys™ —
            the AI-native platform that empowers every organization to work
            smarter, scale faster, and own their future.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ marginBottom: "56px" }}
            data-ocid="launch.panel"
          >
            <p
              style={{
                color: COLORS.muted,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "20px",
              }}
            >
              {launchDateMs !== null ? "Launch countdown" : "Status"}
            </p>
            <Countdown launchDateMs={launchDateMs} />
          </motion.div>

          {/* Early Access Form */}
          <EarlyAccessForm />
        </section>

        {/* ── Feature Highlights ── */}
        <section
          style={{
            padding: "80px 24px",
            borderTop: `1px solid ${COLORS.cardBorder}`,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 700,
                color: COLORS.heading,
                marginBottom: "12px",
              }}
            >
              Built for the next era of work
            </h2>
            <p
              style={{
                color: COLORS.body,
                fontSize: "0.95rem",
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              Everything you need to deploy, manage, and scale AI-powered
              services across your organization.
            </p>
          </div>
          <FeatureCards />
        </section>

        {/* ── Social Share ── */}
        <section
          style={{
            padding: "0 24px 40px",
            borderTop: `1px solid ${COLORS.cardBorder}`,
          }}
        >
          <SocialShare />
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${COLORS.cardBorder}`,
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: COLORS.muted,
            fontSize: "0.8rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          © {new Date().getFullYear()} AAAgencies SerVSys™ · Ours Empowers YOurs
        </p>
      </footer>
    </div>
  );
}
