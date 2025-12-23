"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type NavbarMode = "home" | "browseposts" | "dashboard" | "auth";

export default function Navbar({ mode }: { mode: NavbarMode }) {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  // ✅ Fetch session + profile when Navbar mounts
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setProfile(profileData);
      }
    };
    checkSession();

    // Listen for login/logout events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const hasProfile = !!profile;

  return (
    <header className="border-b border-border bg-card h-16 flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        {/* Left: Logo */}
        <h1>
          <Link href="/" className="text-2xl font-bold text-primary">
            ConnectHub
          </Link>
        </h1>

        {/* Right: Conditional buttons */}
        <div className="flex gap-3 items-center">
          {mode === "home" && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push("/auth?mode=login")}
                className="hover:bg-accent"
              >
                Log In
              </Button>
              <Button
                onClick={() => router.push("/auth?mode=signup")}
                className="bg-primary hover:bg-primary-hover"
              >
                Create Account
              </Button>
            </>
          )}

          {mode === "browseposts" && (
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="hover:bg-accent"
            >
              Back to Dashboard
            </Button>
          )}

          {mode === "dashboard" && user && (
            <>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
              <div
                className="cursor-pointer"
                onClick={() =>
                  router.push(hasProfile ? "/Profile" : "/CreateProfile")
                }
              >
                <Avatar>
                  <AvatarImage src="/default-avatar.png" alt="Profile" />
                  <AvatarFallback>
                    {profile?.name?.[0] ?? user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </>
          )}

          {mode === "auth" && <></>}
        </div>
      </div>
    </header>
  );
}
