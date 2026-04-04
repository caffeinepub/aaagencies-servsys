import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  Globe2,
  Loader2,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", label: "🇺🇸 English" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "zh", label: "🇨🇳 普通话" },
  { code: "ar", label: "🇸🇦 العربية" },
  { code: "pt", label: "🇧🇷 Português" },
  { code: "sw", label: "🇰🇪 Kiswahili" },
];

interface AuthPageProps {
  onRegistered: () => void;
}

export default function AuthPage({ onRegistered }: AuthPageProps) {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor } = useActor();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    preferredLanguage: "en",
    inviteCode: "",
  });
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) throw new Error("Not authenticated");
      const result = await actor.registerUser({
        principal: identity.getPrincipal(),
        displayName: formData.displayName,
        email: formData.email,
        preferredLanguage: formData.preferredLanguage,
      });
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      setEmailWarning(null);
      toast.success("Registration complete! Welcome to AAAgencies.");
      onRegistered();
    },
    onError: (err: Error) => {
      if (err.message.toLowerCase().includes("email already in use")) {
        setEmailWarning(err.message);
      } else {
        toast.error(err.message);
      }
    },
  });

  const features = [
    { icon: Zap, label: "AI-Powered Agent Swarms" },
    { icon: Shield, label: "Self-Sovereign Identity" },
    { icon: Users, label: "Multi-Org & Multi-Role" },
    { icon: Globe2, label: "Multi-Lingual Worldwide" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div>
          <div className="mb-12">
            <h1 className="font-display text-3xl font-bold text-foreground">
              AAAgencies
              <span className="text-primary"> SerVSys</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              AI Agents & Agencies as a Service
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Ours Empowers YOurs
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              You Be Your Best. Self Sovereign Always & In All Ways. Transform
              everything through AI-powered intelligence.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          FinFracFran™ Framework • SerVSys™ Platform • © 2026 AAAgencies
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "login"
                ? "Connect with Internet Identity to continue"
                : "Join the AAAgencies platform"}
            </p>
          </div>

          {!identity ? (
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <p className="text-sm text-muted-foreground text-center">
                  AAAgencies uses Internet Identity for secure, self-sovereign
                  authentication. No passwords required.
                </p>
              </CardHeader>
              <CardContent className="pb-6">
                <Button
                  className="w-full"
                  onClick={login}
                  disabled={isLoggingIn || isInitializing}
                  data-ocid="auth.primary_button"
                >
                  {isLoggingIn || isInitializing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Connect with Internet Identity
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  New user? Connect first, then complete your profile.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    placeholder="Your full name"
                    value={formData.displayName}
                    onChange={(e) => {
                      setFormData((f) => ({
                        ...f,
                        displayName: e.target.value,
                      }));
                    }}
                    data-ocid="auth.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setEmailWarning(null);
                      setFormData((f) => ({ ...f, email: e.target.value }));
                    }}
                    data-ocid="auth.input"
                  />
                  {emailWarning && (
                    <Alert
                      variant="destructive"
                      className="border-yellow-500/40 bg-yellow-500/10 text-yellow-300 [&>svg]:text-yellow-400"
                      data-ocid="auth.error_state"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-yellow-300 text-xs leading-relaxed">
                        This email is already registered to another account.
                        Since Internet Identity is your unique login, you may
                        continue — but consider using a different email if this
                        one isn&#39;t yours.
                        <br />
                        <button
                          type="button"
                          className="mt-1.5 underline underline-offset-2 hover:no-underline font-medium text-yellow-200"
                          onClick={() => setEmailWarning(null)}
                          data-ocid="auth.cancel_button"
                        >
                          Dismiss and try a different email
                        </button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(v) =>
                      setFormData((f) => ({ ...f, preferredLanguage: v }))
                    }
                  >
                    <SelectTrigger data-ocid="auth.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Invite Code{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    placeholder="Enter invite code if you have one"
                    value={formData.inviteCode}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, inviteCode: e.target.value }))
                    }
                    data-ocid="auth.input"
                  />
                </div>
                <Button
                  className="w-full mt-2"
                  onClick={() => registerMutation.mutate()}
                  disabled={
                    registerMutation.isPending ||
                    !formData.displayName ||
                    !formData.email
                  }
                  data-ocid="auth.submit_button"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {identity && (
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                Already have an account? Just connect with Internet Identity.
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
