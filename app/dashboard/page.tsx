"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth?mode=login");
        return;
      }

      // Pre‑fetch profile once
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("user_id, name, age, gender, introduction")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch error:", error.message);
      }

      setProfile(profileData);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // ✅ Handler for "Make a Post"
  const handleCreatePostClick = () => {
    if (
      !profile ||
      !profile.name?.trim() ||
      !profile.age ||
      !profile.gender?.trim() ||
      !profile.introduction?.trim()
    ) {
      router.push("/CreateProfile");
      return;
    }

    router.push("/CreatePost");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode="dashboard" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              Welcome to Your Dashboard
            </h2>
            <p className="text-muted-foreground">
              What would you like to do today?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Make a Post card */}
            <Card
              className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleCreatePostClick}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                  {/* SVG unchanged */}
                </div>
                <CardTitle className="text-2xl">Make a Post</CardTitle>
                <CardDescription className="text-base">
                  Share your thoughts and experiences with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-primary hover:bg-primary-hover"
                  onClick={handleCreatePostClick}
                >
                  Create Post
                </Button>
              </CardContent>
            </Card>

            {/* Browse Posts card */}
            <Card
              className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/BrowsePosts")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                  {/* SVG unchanged */}
                </div>
                <CardTitle className="text-2xl">Search a Post</CardTitle>
                <CardDescription className="text-base">
                  Discover posts from other users and connect with them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full hover:bg-accent">
                  Browse Posts
                </Button>
              </CardContent>
            </Card>

            {/* My Posts card */}
            <Card
              className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/MyPosts")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                  {/* SVG unchanged */}
                </div>
                <CardTitle className="text-2xl">My Posts</CardTitle>
                <CardDescription className="text-base">
                  View, edit, or delete the posts you’ve created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full hover:bg-accent">
                  Manage My Posts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
