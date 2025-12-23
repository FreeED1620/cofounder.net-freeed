"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

const Landing = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();

    // ✅ Correct destructuring
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode="dashboard" />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
            Don't Just Have an Idea.
            <br />
            <span className="text-primary">Find the Team to Launch It.</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
            The most successful startups started with a **single connection.**
            Join the centralized platform designed to help student founders find
            co-pilots, collaborators, and lifelong partners in innovation.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            {isLoggedIn ? (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push("/CreatePost")}
                  className="bg-primary hover:bg-primary-hover text-lg px-8 py-6"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="text-lg px-8 py-6 hover:bg-accent"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push("/auth?mode=signup")}
                  className="bg-primary hover:bg-primary-hover text-lg px-8 py-6"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/auth?mode=login")}
                  className="text-lg px-8 py-6 hover:bg-accent"
                >
                  Log In
                </Button>
              </>
            )}
          </div>

          {/* ✅ Only one card now, centered */}
          <div className="pt-16 flex justify-center">
            <div
              className="p-6 rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer max-w-sm"
              onClick={() => router.push("/BrowsePosts")}
            >
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                {/* SVG unchanged */}
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover Others</h3>
              <p className="text-muted-foreground">
                Explore profiles and connect with interesting people
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
