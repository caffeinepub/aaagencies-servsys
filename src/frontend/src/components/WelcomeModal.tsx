import { RoleBadge } from "@/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { User } from "../backend.d";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

const ROLE_MESSAGES: Record<string, string> = {
  super_admin:
    "You have full platform access. Configure organizations, manage users, and oversee the entire SerVSys ecosystem.",
  org_admin:
    "Your organization workspace is ready. Set up your team, branches, and AI agents to get started.",
  team_member:
    "You've joined a team. Check your tasks, explore active agents, and manage your wallet.",
  end_customer:
    "Your service portal is ready. Browse available services and submit your first request.",
};

const ROLE_ACCENT: Record<string, string> = {
  super_admin: "from-amber-500/20 to-amber-500/5",
  org_admin: "from-blue-500/20 to-blue-500/5",
  team_member: "from-teal-500/20 to-teal-500/5",
  end_customer: "from-slate-500/20 to-slate-500/5",
};

export function WelcomeModal({ open, onClose, user }: WelcomeModalProps) {
  const role =
    typeof user.role === "object"
      ? Object.keys(user.role as object)[0]
      : String(user.role);

  const message = ROLE_MESSAGES[role] ?? ROLE_MESSAGES.end_customer;
  const accentGradient = ROLE_ACCENT[role] ?? ROLE_ACCENT.end_customer;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg border-border/60 bg-card p-0 overflow-hidden"
        data-ocid="welcome.modal"
      >
        {/* Gradient header band */}
        <div
          className={`bg-gradient-to-b ${accentGradient} px-8 pt-8 pb-6 relative overflow-hidden`}
        >
          {/* Decorative orb */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-md bg-primary/15">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-sm text-primary tracking-wide">
                AAAgencies
              </span>
              <span className="font-display font-bold text-sm text-foreground tracking-wide">
                SerVSys™
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">
              Ours Empowers YOurs
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
              Welcome, <span className="text-primary">{user.displayName}</span>!
            </h2>
            <p className="text-xs text-muted-foreground mt-2 italic">
              You Be Your Best. Self Sovereign Always &amp; In All Ways.
            </p>
          </motion.div>
        </div>

        {/* Body */}
        <motion.div
          className="px-8 pb-8 pt-5 space-y-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <RoleBadge role={role} className="text-sm px-3 py-0.5" />
            <span className="text-xs text-muted-foreground">
              Your access level
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-4">
            {message}
          </p>

          <div className="pt-1">
            <Button
              className="w-full gap-2 font-display font-semibold"
              size="lg"
              onClick={onClose}
              data-ocid="welcome.primary_button"
            >
              Let&#39;s Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            SerVSys™ Platform &nbsp;·&nbsp; FinFracFran™ Framework
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
