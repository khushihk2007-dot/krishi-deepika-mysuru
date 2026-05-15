import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { OtpGrid } from "@/components/auth/OtpGrid";
import { useLang } from "@/hooks/useLang";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";

const REDIRECT: Record<string, string> = {
  farmer: "/dashboard",
  buyer: "/dashboard",
  labourer: "/work-feed",
};

export default function Login() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    if (phone.length !== 10) return toast.error("Enter a valid 10-digit phone number");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("OTP sent");
    setStep("otp");
  };

  const verify = async () => {
    if (otp.length !== 6) return toast.error("Enter the 6-digit OTP");
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: "sms",
    });
    if (error || !data.user) {
      setBusy(false);
      return toast.error(error?.message ?? "Invalid OTP");
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();
    setBusy(false);
    toast.success("Welcome back!");
    navigate(REDIRECT[profile?.role ?? "farmer"] ?? "/dashboard", { replace: true });
  };

  return (
    <AuthShell>
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LogIn className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">{t("login.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("login.sub")}</p>
          </div>
        </div>

        {step === "phone" ? (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-base font-semibold">{t("auth.phone")}</Label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <Button onClick={sendOtp} disabled={busy} className="w-full lift-btn rounded-xl" size="lg">
              {t("cta.sendOtp")}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {t("cta.changeNumber")}
            </button>
            <div>
              <Label className="text-base font-semibold">{t("auth.otp")}</Label>
              <p className="mt-1 text-sm text-muted-foreground">+91 {phone}</p>
              <div className="mt-4">
                <OtpGrid value={otp} onChange={setOtp} disabled={busy} />
              </div>
            </div>
            <Button onClick={verify} disabled={busy || otp.length !== 6} className="w-full lift-btn rounded-xl" size="lg">
              {t("cta.verify")}
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("cta.noAccount")}{" "}
          <a href="/welcome" className="font-semibold text-primary hover:underline">
            {t("cta.signupLink")}
          </a>
        </p>
      </div>
    </AuthShell>
  );
}
