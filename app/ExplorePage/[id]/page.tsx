"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  introduction: string;
}

interface Post {
  id: string;
  role_summary: string;
  content: string;
  created_at: string;
  social_link?: string; // ✅ add social_link
}

export default function ExplorePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, age, gender, introduction")
          .eq("id", id)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("id, role_summary, content, created_at, social_link") // ✅ include social_link
          .eq("profile_id", id)
          .order("created_at", { ascending: false });

        if (postError) throw postError;
        setPosts(postData || []);
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode="browseposts" />
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{profile.name}</CardTitle>
            <CardDescription>
              {profile.age ? `${profile.age} years old` : "Age not specified"} •{" "}
              {profile.gender || "Gender not specified"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Introduction
              </h3>
              <p className="text-foreground">
                {profile.introduction || "No introduction provided."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Posts
              </h3>
              {posts.length === 0 ? (
                <p className="text-muted-foreground">No posts yet.</p>
              ) : (
                posts.map((post) => (
                  <Card
                    key={post.id}
                    className="mt-4 shadow-sm cursor-pointer"
                    onClick={() => setSelectedPost(post)} // open modal
                  >
                    <CardContent className="pt-4 space-y-2">
                      <p className="font-semibold text-primary">
                        {post.role_summary}
                      </p>
                      <p className="text-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Posted on{" "}
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* ✅ Bottom row with Back + Connect */}
            {/* ✅ Bottom row with Back + Connect */}
            <div className="flex justify-between">
              <Button
                onClick={() => router.push("/BrowsePosts")}
                className="bg-primary hover:bg-primary-hover"
              >
                Back to Listings
              </Button>

              {posts.some((p) => p.social_link) && (
                <Button
                  onClick={() => {
                    const firstLink = posts.find(
                      (p) => p.social_link
                    )?.social_link;
                    if (firstLink) window.open(firstLink, "_blank");
                  }}
                  className="bg-primary hover:bg-primary-hover" // ✅ same style as Back button
                >
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Inline Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-2 text-primary">
              {selectedPost.role_summary}
            </h2>
            <p className="text-foreground mb-4">{selectedPost.content}</p>
            <p className="text-xs text-muted-foreground">
              Posted on {new Date(selectedPost.created_at).toLocaleDateString()}
            </p>
            <Button
              onClick={() => setSelectedPost(null)}
              className="mt-6 bg-primary hover:bg-primary-hover"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
