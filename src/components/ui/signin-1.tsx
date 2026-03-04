import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Signin1Props {
    heading?: string;
    logo?: {
        url: string;
        src: string;
        alt: string;
        title?: string;
    };
    signinText?: string;
    googleText?: string;
    signupText?: string;
    signupUrl?: string;
    forgotPasswordUrl?: string;
    onSignIn?: (email: string, password: string) => void;
    onGoogleSignIn?: () => void;
    loading?: boolean;
}

const Signin1 = ({
    heading = "Welcome back",
    logo,
    googleText = "Sign in with Google",
    signinText = "Sign in",
    signupText = "Don't have an account?",
    signupUrl = "/signup",
    forgotPasswordUrl = "/forgot-password",
    onSignIn,
    onGoogleSignIn,
    loading = false,
}: Signin1Props) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        onSignIn?.(email, password);
    };

    return (
        <section className="bg-muted h-screen">
            <div className="flex h-full items-center justify-center">
                <div className="border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
                    <div className="flex flex-col items-center gap-y-2">
                        {/* Logo */}
                        <div className="flex items-center gap-2 lg:justify-start">
                            {logo?.src ? (
                                <a href={logo.url || "/"}>
                                    <img
                                        src={logo.src}
                                        alt={logo.alt}
                                        title={logo.title}
                                        className="h-10 dark:invert"
                                    />
                                </a>
                            ) : (
                                <a href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <span>🌱</span>
                                    <span>AgroSmart</span>
                                </a>
                            )}
                        </div>
                        {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
                    </div>
                    <div className="flex w-full flex-col gap-8">
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2">
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                />
                                <div className="flex justify-end">
                                    <a
                                        href={forgotPasswordUrl}
                                        className="text-muted-foreground text-xs hover:text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <Button type="submit" className="mt-2 w-full" disabled={loading}>
                                    {loading ? "Signing in..." : signinText}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={onGoogleSignIn}
                                    disabled={loading}
                                >
                                    <FcGoogle className="mr-2 size-5" />
                                    {googleText}
                                </Button>
                            </div>
                        </form>
                    </div>
                    <div className="text-muted-foreground flex justify-center gap-1 text-sm">
                        <p>{signupText}</p>
                        <a
                            href={signupUrl}
                            className="text-primary font-medium hover:underline"
                        >
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export { Signin1 };
