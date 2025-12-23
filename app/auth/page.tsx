"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";

const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100),
});

export default function Auth() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();

  const mode = (sp.get("mode") as "signup" | "login") || "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      authSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: err.issues[0]?.message ?? "Invalid input",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        // 🔹 Try to sign in first to detect existing account
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: "dummy-password", // any string, we only care if account exists
        });

        if (!loginError) {
          // If no error, account exists
          toast({
            title: "Signup error",
            description: "Email already in use. Please log in instead.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // If login failed with "Invalid login credentials", account exists
        if (loginError.message.includes("Invalid login credentials")) {
          toast({
            title: "Signup error",
            description: "Email already in use. Please log in instead.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Otherwise, proceed with signup
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (error) {
          toast({
            title: "Signup error",
            description: error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        toast({
          title: "Account created",
          description: "Check your email to verify your account.",
        });
        router.push("/auth?mode=login");
        return;
      }

      // 🔹 Login flow
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) {
        toast({
          title: "Unable to log in",
          description: "Check your credentials.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Logged in", description: "Welcome back!" });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Auth error",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar at the top, same as listings page */}
      <Navbar mode="auth" />

      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto mt-8">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {mode === "signup" ? "Create Account" : "Log In"}
              </CardTitle>
              <CardDescription className="text-center">
                {mode === "signup"
                  ? "Enter your email and password to create a new account"
                  : "Enter your credentials to access your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : mode === "signup"
                    ? "Create Account"
                    : "Log In"}
                </Button>
              </form>

              {/* Toggle buttons */}
              <div className="mt-4 text-center">
                {mode === "signup" ? (
                  <Button
                    variant="link"
                    onClick={() => router.push("/auth?mode=login")}
                  >
                    Already have an account? Log in
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    onClick={() => router.push("/auth?mode=signup")}
                  >
                    Don’t have an account? Create one
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
