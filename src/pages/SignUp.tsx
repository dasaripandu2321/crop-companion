import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Signup1 } from "@/components/ui/signup-1";

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: email.split("@")[0],
      });
      toast.success("Account created! Welcome to AgroSmart 🌱");
      navigate("/");
    } catch (error: any) {
      const msg =
        error.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : error.code === "auth/weak-password"
            ? "Password must be at least 6 characters."
            : error.code === "auth/invalid-email"
              ? "Please enter a valid email address."
              : "Failed to create account. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed up with Google! Welcome 🌱");
      navigate("/");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Signup1
      heading="Create your account"
      signupText="Create an account"
      googleText="Sign up with Google"
      loginText="Already have an account?"
      loginUrl="/signin"
      onSignUp={handleSignUp}
      onGoogleSignUp={handleGoogleSignUp}
      loading={loading}
    />
  );
}
