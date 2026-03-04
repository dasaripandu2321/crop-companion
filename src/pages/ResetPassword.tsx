import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ResetPasswordForm {
  new_password: string;
  confirm_password: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const form = useForm<ResetPasswordForm>({
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    const resetEmail = sessionStorage.getItem("resetEmail");
    const otpVerified = sessionStorage.getItem("otpVerified");

    if (!resetEmail || !otpVerified) {
      toast({
        title: "Error",
        description: "Please complete the verification steps first",
        variant: "destructive",
      });
      navigate("/forgot-password");
      return;
    }
    setEmail(resetEmail);
  }, []);

  const onSubmit = async (data: ResetPasswordForm) => {
    // Validate password match
    if (data.new_password !== data.confirm_password) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (data.new_password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Firebase auth disabled: simulate successful password reset on frontend
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("otpVerified");

      toast({
        title: "Success",
        description: "Password reset successfully (demo mode). Redirecting to sign in...",
      });

      setTimeout(() => navigate("/signin"), 1500);
    } catch {
      toast({
        title: "Error",
        description: "Failed to reset password (demo mode)",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Create New Password</CardTitle>
          <CardDescription className="text-center">
            Set a strong password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
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
                {loading ? "Resetting..." : "Reset Password"}
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

          <div className="mt-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-foreground">
              🔒 <span className="font-semibold">Security:</span> Use a strong password with mix of uppercase, lowercase, numbers, and symbols.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
