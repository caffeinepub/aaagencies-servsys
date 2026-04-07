import { RoleBadge } from "@/components/RoleBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, UserCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";

const LANGUAGES = [
  { code: "en", label: "\uD83C\uDDFA\uD83C\uDDF8 English" },
  { code: "es", label: "\uD83C\uDDEA\uD83C\uDDF8 Espa\u00F1ol" },
  { code: "fr", label: "\uD83C\uDDEB\uD83C\uDDF7 Fran\u00E7ais" },
  { code: "zh", label: "\uD83C\uDDE8\uD83C\uDDF3 \u666E\u901A\u8BDD" },
  {
    code: "ar",
    label:
      "\uD83C\uDDF8\uD83C\uDDE6 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  },
  { code: "pt", label: "\uD83C\uDDE7\uD83C\uDDF7 Portugu\u00EAs" },
  { code: "sw", label: "\uD83C\uDDF0\uD83C\uDDEA Kiswahili" },
];

interface InviteLink {
  id: string;
  code: string;
  role: unknown;
  maxRedemptions?: bigint[];
  redemptionCount: bigint;
  expiresAt?: bigint[];
  isActive: boolean;
  createdAt: bigint;
}

interface InviteRedeemPageProps {
  code?: string;
  onSuccess: () => void;
}

export default function InviteRedeemPage({
  code = "",
  onSuccess,
}: InviteRedeemPageProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const [manualCode, setManualCode] = useState("");
  const [activeCode, setActiveCode] = useState(code);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    preferredLanguage: "en",
  });
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  const getRoleName = (role: unknown): string => {
    if (typeof role === "object" && role !== null) {
      const key = Object.keys(role as object)[0];
      return key ?? "unknown";
    }
    if (typeof role === "string") return role;
    return "unknown";
  };

  // Validate the invite code on mount or when activeCode changes
  const {
    data: inviteLink,
    isLoading: validating,
    isError: validationFailed,
    error: validationError,
  } = useQuery<InviteLink>({
    queryKey: ["inviteLink", activeCode],
    queryFn: async () => {
      if (!actor || !activeCode) throw new Error("No code provided");
      const result = await (actor as any).getInviteLinkByCode(activeCode);
      if (result.__kind__ === "err") throw new Error(result.err);
      if (!result.ok.isActive)
        throw new Error("This invite link is no longer active.");
      return result.ok as InviteLink;
    },
    enabled: !!actor && !isFetching && !!activeCode,
    retry: false,
  });

  // Redeem mutation
  const redeemMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) throw new Error("Not authenticated");
      if (!activeCode) throw new Error("No invite code");
      const result = await (actor as any).redeemInviteLink(activeCode, {
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
      toast.success("Invite redeemed! Your account is ready.");
      onSuccess();
    },
    onError: (err: Error) => {
      if (err.message.toLowerCase().includes("email already in use")) {
        setEmailWarning(err.message);
      } else {
        toast.error(err.message);
      }
    },
  });

  const isInvalidCode =
    (validationFailed || (inviteLink && !inviteLink.isActive)) && activeCode;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold">
            You&#39;ve been invited
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Complete your profile to join AAAgencies SerVSys
          </p>
        </div>

        {/* No code yet -- show manual entry */}
        {!activeCode && (
          <Card className="border-border/60 mb-4" data-ocid="invite.card">
            <CardHeader>
              <CardTitle className="text-base font-display">
                Enter Your Invite Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Invite Code</Label>
                <Input
                  placeholder="Paste your invite code here"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="font-mono"
                  data-ocid="invite.input"
                />
              </div>
              <Button
                className="w-full"
                data-ocid="invite.primary_button"
                disabled={!manualCode.trim()}
                onClick={() => setActiveCode(manualCode.trim())}
              >
                Validate Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Validating */}
        {activeCode && validating && (
          <Card
            className="border-border/60 mb-4"
            data-ocid="invite.loading_state"
          >
            <CardContent className="flex items-center gap-3 py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">
                Validating invite code...
              </span>
            </CardContent>
          </Card>
        )}

        {/* Suppress unused import */}
        {false && <Skeleton />}

        {/* Invalid code error */}
        {isInvalidCode && (
          <Card
            className="border-destructive/40 bg-destructive/5 mb-4"
            data-ocid="invite.error_state"
          >
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <XCircle className="w-10 h-10 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  Invalid Invite Link
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(validationError as Error)?.message ??
                    "This invite link is invalid or has expired."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setActiveCode("");
                  setManualCode("");
                }}
                data-ocid="invite.secondary_button"
              >
                Try a different code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Valid invite -- show registration form */}
        {activeCode && !validating && inviteLink && inviteLink.isActive && (
          <>
            {/* Invite info banner */}
            <Card className="border-primary/30 bg-primary/5 mb-4">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      Invite Code
                    </p>
                    <code className="text-xs font-mono text-primary">
                      {activeCode}
                    </code>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs text-muted-foreground">
                      You will join as
                    </p>
                    <RoleBadge role={getRoleName(inviteLink.role)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60" data-ocid="invite.dialog">
              <CardHeader>
                <CardTitle className="text-base font-display">
                  Complete Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    placeholder="Your full name"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        displayName: e.target.value,
                      }))
                    }
                    data-ocid="invite.input"
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
                    data-ocid="invite.input"
                  />
                  {emailWarning && (
                    <Alert
                      variant="destructive"
                      className="border-yellow-500/40 bg-yellow-500/10 text-yellow-300 [&>svg]:text-yellow-400"
                      data-ocid="invite.error_state"
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
                          data-ocid="invite.cancel_button"
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
                    <SelectTrigger data-ocid="invite.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {redeemMutation.isError && !emailWarning && (
                  <div
                    className="flex items-center gap-2 text-destructive text-sm"
                    data-ocid="invite.error_state"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{(redeemMutation.error as Error).message}</span>
                  </div>
                )}

                <Button
                  className="w-full"
                  data-ocid="invite.submit_button"
                  onClick={() => redeemMutation.mutate()}
                  disabled={
                    redeemMutation.isPending ||
                    !formData.displayName ||
                    !formData.email
                  }
                >
                  {redeemMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Platform"
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
