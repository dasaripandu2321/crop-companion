import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const form = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      await sendPasswordResetEmail(auth, data.email);
      setShowOTP(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for a password reset link from Firebase.",
      });
    } catch (error: any) {
      const msg =
        error.code === "auth/user-not-found"
          ? "No account found with this email address."
          : error.code === "auth/invalid-email"
            ? "Please enter a valid email address."
            : "Failed to send reset email. Please try again.";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/verify-otp");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Forgot Password?</CardTitle>
          <CardDescription className="text-center">
            Enter your email address to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOTP ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@gmail.com"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send Verification Code"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signin")}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-lg font-semibold mb-2">OTP Generated Successfully!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your 6-digit verification code is below:
                </p>
              </div>

              {/* OTP Display Box */}
              <div className="relative">
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 border-2 border-primary/50 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Your OTP Code</p>
                  <p className="text-5xl font-bold tracking-widest text-primary">
                    {otpCode}
                  </p>
                  <p className="text-xs text-amber-600 mt-3">⏱️ Valid for 10 minutes</p>
                </div>

                {/* Copy button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => {
                    navigator.clipboard.writeText(otpCode);
                    toast({
                      title: "Copied",
                      description: "OTP copied to clipboard!",
                    });
                  }}
                >
                  📋 Copy Code
                </Button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">📌 Next Steps:</span>
                </p>
                <ol className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>1. Copy the 6-digit code above</li>
                  <li>2. Click "Continue to Verification"</li>
                  <li>3. Paste or type the code in the input boxes</li>
                  <li>4. Create your new password</li>
                </ol>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
              >
                Continue to Verification →
              </Button>
            </div>
          )}

          {!showOTP && (
            <div className="mt-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-foreground">
                ✅ <span className="font-semibold">Instant OTP:</span> System generates OTP instantly. You'll see the code immediately after submitting your email.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
