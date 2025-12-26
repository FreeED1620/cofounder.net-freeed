"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase auto-logs in after verification, so clear the session
    supabase.auth.signOut().finally(() => {
      console.log("Session cleared after verification");
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar at the top */}
      <Navbar mode="auth" />

      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto mt-8">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                Email Verified
              </CardTitle>
              <CardDescription>
                Your email has been successfully verified. Please log in to
                continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                className="bg-primary hover:bg-primary-hover"
                onClick={() => router.push("/auth?mode=login")}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
