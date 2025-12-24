"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

// shadcn/ui Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PostWithProfile {
  id: string;
  role_summary: string;
  created_at: string;
  category: string;
  profile: {
    id: string;
    name: string;
    age: number;
    gender: string;
  } | null;
}

const BrowsePosts = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 🔹 New state for region filtering
  const [filterMode, setFilterMode] = useState("all"); // "all" or "region"
  const [region, setRegion] = useState("Unknown");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // 1️⃣ Resolve viewer's region
        const regionResp = await fetch("/api/resolve-region");
        const { region } = await regionResp.json();
        setRegion(region);

        // 2️⃣ Build base query
        let query = supabase
          .from("posts")
          .select(
            `
            id,
            role_summary,
            category,
            created_at,
            profile:profiles (
              id,
              name,
              age,
              gender
            )
          `
          )
          .order("created_at", { ascending: false });

        // 3️⃣ Apply category filter
        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        // 4️⃣ Apply region filter if selected
        if (filterMode === "region" && region !== "Unknown") {
          query = query.eq("region", region);
        }

        const { data, error } = await query;

        if (error) {
          toast({
            title: "Error loading posts",
            description: error.message,
            variant: "destructive",
          });
          setPosts([]);
        } else {
          const normalized: PostWithProfile[] = (data ?? []).map(
            (post: any) => ({
              id: post.id,
              role_summary: post.role_summary,
              created_at: post.created_at,
              category: post.category ?? "",
              profile: post.profile ?? null,
            })
          );
          setPosts(normalized);
        }
      } catch (err: any) {
        toast({
          title: "Unexpected error",
          description: err?.message ?? "Something went wrong fetching posts",
          variant: "destructive",
        });
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, filterMode, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode="browseposts" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header row: title/desc left, filters right */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                Discover Posts
              </h2>
              <p className="text-muted-foreground">
                Browse posts and connect with interesting people in the
                community
              </p>
            </div>

            {/* 🔹 Right-aligned filters */}
            <div className="flex gap-4 justify-end">
              {/* Category filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="edtech">EdTech</SelectItem>
                  <SelectItem value="healthtech">HealthTech</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="socialimpact">Social Impact</SelectItem>
                </SelectContent>
              </Select>

              {/* Region filter */}
              <Select value={filterMode} onValueChange={setFilterMode}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="region">My Region ({region})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-lg">No posts found</p>
                <p className="text-sm text-muted-foreground">
                  Try a different category or create your first post!
                </p>
                <Button
                  onClick={() => router.push("/CreatePost")}
                  className="bg-primary hover:bg-primary-hover"
                >
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <CardTitle className="text-xl mb-2">
                        {post.profile?.name || "Unknown"}
                      </CardTitle>
                      <CardDescription>
                        {post.category || "Uncategorized"} •{" "}
                        {post.profile?.age
                          ? `${post.profile.age} years old`
                          : "Age not specified"}
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <h3 className="text-sm font-semibold text-muted-foreground">
                            Co-founder Summary
                          </h3>
                          <p className="text-foreground">
                            {post.role_summary || "No summary provided."}
                          </p>
                        </div>
                        {post.profile?.id && (
                          <Button
                            onClick={() =>
                              router.push(`/ExplorePage/${post.profile?.id}`)
                            }
                            className="bg-primary hover:bg-primary-hover shrink-0"
                          >
                            Explore More
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrowsePosts;
