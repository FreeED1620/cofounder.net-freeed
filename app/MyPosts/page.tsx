"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Post {
  id: string;
  role_summary: string;
  content: string;
  category: string;
  created_at: string;
  social_link?: string; // ✅ add social_link to interface
}

export default function MyPosts() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    role_summary: "",
    content: "",
    category: "",
    social_link: "", // ✅ add social_link to formData
  });
  const [profileId, setProfileId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profileData) return;

      setProfileId(profileData.id);

      const { data, error } = await supabase
        .from("posts")
        .select("id, role_summary, content, category, created_at, social_link") // ✅ select social_link
        .eq("profile_id", profileData.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [toast]);

  // ✏️ Edit handler
  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      role_summary: post.role_summary ?? "",
      content: post.content ?? "",
      category: post.category ?? "",
      social_link: post.social_link ?? "", // ✅ populate social_link
    });
  };

  // 💾 Update handler
  const handleUpdate = async () => {
    if (!editingPost || !profileId || !userId) return;

    const { data, error } = await supabase
      .from("posts")
      .update({
        role_summary: formData.role_summary,
        content: formData.content,
        category: formData.category,
        social_link: formData.social_link || null, // ✅ update social_link
      })
      .eq("id", editingPost.id)
      .eq("user_id", userId)
      .eq("profile_id", profileId)
      .select();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else if (!data || data.length === 0) {
      toast({
        title: "Error",
        description: "No post updated.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post updated",
        description: "Your changes have been saved.",
      });
      setPosts(
        posts.map((p) => (p.id === editingPost.id ? { ...p, ...formData } : p))
      );
      setEditingPost(null);
    }
  };

  // 🗑️ Delete handler (unchanged)
  const handleDelete = async (id: string) => {
    if (!profileId || !userId) return;

    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .eq("profile_id", profileId)
      .select();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else if (!data || data.length === 0) {
      toast({
        title: "Error",
        description: "No post deleted.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode="browseposts" />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">My Posts</h1>
        {loading ? (
          <p className="text-muted-foreground">Loading your posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">
            You haven’t created any posts yet.
          </p>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="mb-4 shadow-md">
              <CardHeader>
                <CardTitle>{post.role_summary}</CardTitle>
                <CardDescription>
                  {post.category} • Posted on{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{post.content}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(post)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* ✏️ Edit Modal */}
        {editingPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
              <h2 className="text-xl font-semibold mb-4">Edit Post</h2>
              <Input
                value={formData.role_summary}
                onChange={(e) =>
                  setFormData({ ...formData, role_summary: e.target.value })
                }
                placeholder="Role summary"
                className="mb-2"
              />
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Post content"
                className="mb-2"
              />
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                value={formData.category}
              >
                <SelectTrigger className="w-full mb-2">
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

              {/* ✅ Social link field in edit modal */}
              <Input
                value={formData.social_link}
                onChange={(e) =>
                  setFormData({ ...formData, social_link: e.target.value })
                }
                placeholder="Social media link (optional)"
                className="mb-2"
              />

              <div className="flex gap-2 mt-4">
                <Button onClick={handleUpdate} className="bg-primary">
                  Save
                </Button>
                <Button onClick={() => setEditingPost(null)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
