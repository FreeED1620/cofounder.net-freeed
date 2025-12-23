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
          <h2 className="text-5xl font-bold text-foreground leading-tight">
            Don't Just Have an Idea.
            <br />
            <span className="text-primary text-4xl md:text-5xl">
              Find the Partner to Build It.
            </span>
          </h2>

          {/* ✅ Fixed Alignment & Spacing */}
          <div className="flex justify-center py-2">
            <button
              onClick={() => router.push("/BrowsePosts")}
              className="group relative flex items-center justify-center w-full max-w-[440px] h-14 rounded-full border border-border bg-background hover:border-primary/30 transition-all duration-500 ease-in-out overflow-hidden shadow-sm"
            >
              {/* Main Text: 
      1. Starts perfectly centered (no translate)
      2. On hover, slides left (-translate-x-24) and turns blue
    */}
              <span className="text-lg font-normal text-black transition-all duration-500 ease-in-out group-hover:text-primary group-hover:-translate-x-24 whitespace-nowrap">
                Connect with Co-founders
              </span>

              {/* Reveal Container: 
      1. Hidden off-center to the right (translate-x-12)
      2. Slides into position (translate-x-0) without hitting the text
    */}
              <div className="absolute right-6 flex items-center opacity-0 translate-x-12 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-in-out">
                {/* The Vertical Bar you wanted - properly spaced with mx-4 */}
                <div className="h-6 w-[1px] bg-border mx-4" />

                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium whitespace-nowrap">
                    View Listings
                  </span>

                  {/* Blue Circle Arrow Icon */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            History shows that the most successful startups almost always begin
            with a team, yet finding the right partner remains the biggest
            hurdle for student founders. We’ve centralized the search so you can
            skip the struggle and connect directly with the co-founders ready to
            build with you.
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

          {/* <div className="pt-16 flex justify-center">
            <div
              className="p-6 rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer max-w-sm"
              onClick={() => router.push("/BrowsePosts")}
            >
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover Others</h3>
              <p className="text-muted-foreground">
                Explore profiles and connect with interesting people
              </p>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default Landing;
