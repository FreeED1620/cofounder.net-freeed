"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // ✅ Import Input
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
import Navbar from "@/components/Navbar";

const postSchema = z.object({
  roleSummary: z
    .string()
    .trim()
    .min(5, { message: "Role summary must be at least 5 characters" })
    .max(280, { message: "Role summary must be under 280 characters" }),
  content: z
    .string()
    .trim()
    .min(10, { message: "Post content must be at least 10 characters" })
    .max(5000),
  category: z.string().min(1, { message: "Please select a category" }),
  socialLink: z
    .string()
    .trim()
    .url({ message: "Please enter a valid social media link" }),
});

const CreatePost = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [roleSummary, setRoleSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [socialLink, setSocialLink] = useState(""); // ✅ new state

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth?mode=login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!profile) {
        toast({
          title: "Profile missing",
          description: "Please complete your profile before posting.",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      setProfileId(profile.id);
    };

    fetchProfile();
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      postSchema.parse({ roleSummary, content, category, socialLink });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.issues[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Not authenticated");
      if (!profileId) throw new Error("Profile not found");

      const regionResp = await fetch("/api/resolve-region");
      const { region } = await regionResp.json();

      const { error: postError } = await supabase.from("posts").insert({
        user_id: session.user.id,
        profile_id: profileId,
        role_summary: roleSummary,
        content,
        category,
        region,
        social_link: socialLink || null, // ✅ save link if provided
      });

      if (postError) throw postError;

      toast({
        title: "Success!",
        description: "Your post has been created.",
      });

      router.push("/BrowsePosts");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while creating your post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode="browseposts" />

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Post</CardTitle>
            <CardDescription>
              Share your thoughts with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roleSummary">Co-founder Role Summary *</Label>
                <Textarea
                  id="roleSummary"
                  placeholder="E.g. Seeking a co-founder to lead backend development for a student platform..."
                  value={roleSummary}
                  onChange={(e) => setRoleSummary(e.target.value)}
                  rows={2}
                  maxLength={280}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Post Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, experiences, or insights..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  onValueChange={(value) => setCategory(value)}
                  value={category}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="edtech">EdTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="socialimpact">Social Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ✅ Social Media Link Placeholder */}
              <div className="space-y-2">
                <Label htmlFor="socialLink">Social Media Link *</Label>
                <Input
                  id="socialLink"
                  type="url"
                  placeholder="Paste your WhatsApp, Instagram, LinkedIn link..."
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover"
                disabled={loading}
              >
                {loading ? "Publishing..." : "Publish Post"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
