import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Signin1 } from "@/components/ui/signin-1";

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully!");
      navigate("/");
    } catch (error: any) {
      const msg =
        error.code === "auth/user-not-found"
          ? "No account found with this email."
          : error.code === "auth/wrong-password"
            ? "Incorrect password. Please try again."
            : error.code === "auth/invalid-credential"
              ? "Invalid email or password."
              : error.code === "auth/too-many-requests"
                ? "Too many attempts. Please try again later."
                : "Sign in failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in with Google!");
      navigate("/");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Signin1
      heading="Welcome back"
      signinText="Sign in"
      googleText="Sign in with Google"
      signupText="Don't have an account?"
      signupUrl="/signup"
      forgotPasswordUrl="/forgot-password"
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      loading={loading}
    />
  );
}
