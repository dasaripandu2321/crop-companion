import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const resetEmail = sessionStorage.getItem("resetEmail");
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please start with forgot password page",
        variant: "destructive",
      });
      navigate("/forgot-password");
      return;
    }
    setEmail(resetEmail);

    // Timer for OTP expiration
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: "Error",
            description: "OTP has expired. Please request a new one.",
            variant: "destructive",
          });
          navigate("/forgot-password");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Move to next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace to previous field
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    const newOtp = pastedData.split("").concat(Array(6 - pastedData.length).fill(""));
    setOtp(newOtp as string[]);
    
    // Focus last filled input or last input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid Input",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "OTP verified! Create your new password",
        });
        sessionStorage.setItem("otpVerified", "true");
        setTimeout(() => navigate("/reset-password"), 1500);
      } else {
        toast({
          title: "Error",
          description: result.error || "Invalid OTP",
          variant: "destructive",
        });
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP",
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
          <CardTitle className="text-2xl font-bold text-center">Verify Code</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* OTP Input Fields */}
            <div>
              <label className="block text-sm font-medium mb-3">Verification Code</label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    placeholder="0"
                    className="w-12 h-14 text-2xl font-bold text-center border-2 border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-background hover:border-primary/50"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-amber-600">
                ⏱️ Expires in: {formatTime(timeLeft)}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive code?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-primary hover:underline font-medium"
                >
                  Request Again
                </button>
              </p>
            </div>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-foreground">
              💡 <span className="font-semibold">Tip:</span> You can paste the code directly. Use arrow keys to navigate between digits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
