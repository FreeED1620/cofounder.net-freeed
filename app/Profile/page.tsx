"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    introduction: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth?mode=login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        toast({ title: "Error", description: error.message });
        return;
      }

      if (!data) {
        // 🚫 No profile → redirect to CreateProfile
        router.replace("/CreateProfile");
        return;
      }

      setProfile(data);
      setFormData({
        name: data.name || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        introduction: data.introduction || "",
      });
      setLoading(false);
    };

    fetchProfile();
  }, [router, toast]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Not authenticated");

      // 🔹 Try update and force return updated row
      const {
        data: updated,
        error: updateError,
        status,
      } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          age: formData.age ? Number(formData.age) : null, // avoid NaN
          gender: formData.gender,
          introduction: formData.introduction,
        })
        .eq("user_id", user.id)
        .select("*") // force return row so RLS issues surface
        .maybeSingle();

      console.log("Update status:", status);
      console.log("Updated row:", updated);
      console.log("Update error:", updateError);

      if (updateError) throw updateError;
      if (!updated) {
        throw new Error(
          "Update did not return a row. Likely blocked by RLS or no matching row."
        );
      }

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });

      // 🔹 Refresh local state from returned row
      setProfile(updated);
      setFormData({
        name: updated.name || "",
        age: updated.age?.toString() || "",
        gender: updated.gender || "",
        introduction: updated.introduction || "",
      });
    } catch (err: any) {
      console.error("Profile update failed:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode="browseposts" />

      <Card className="max-w-md mx-auto mt-12 shadow-lg">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Input
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div>
              <Label>Introduction</Label>
              <Textarea
                value={formData.introduction}
                onChange={(e) =>
                  setFormData({ ...formData, introduction: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
