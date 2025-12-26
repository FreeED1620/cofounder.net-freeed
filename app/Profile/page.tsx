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

// shadcn/ui Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Profile() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
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

      // 🚫 No row OR incomplete profile → redirect to CreateProfile
      if (!data || !data.name || !data.introduction) {
        router.replace("/CreateProfile");
        return;
      }

      // ✅ Pre-fill form with saved data
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
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // ✅ Validation checks
      if (!formData.name.trim()) {
        toast({
          title: "Validation error",
          description: "Please enter your name.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const parsedAge = parseInt(formData.age, 10);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        toast({
          title: "Validation error",
          description: "Please enter a valid age between 1 and 120.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.gender) {
        toast({
          title: "Validation error",
          description: "Please select your gender.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.introduction.trim()) {
        toast({
          title: "Validation error",
          description: "Please add an introduction about yourself.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: updated, error } = await supabase
        .from("profiles")
        .update({
          name: formData.name.trim(),
          age: parsedAge,
          gender: formData.gender,
          introduction: formData.introduction.trim(),
        })
        .eq("user_id", user.id)
        .select("*")
        .maybeSingle();

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });

      // Refresh local state
      if (updated) {
        setFormData({
          name: updated.name || "",
          age: updated.age?.toString() || "",
          gender: updated.gender || "",
          introduction: updated.introduction || "",
        });
      }
    } catch (err: any) {
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
          <CardTitle>Update Your Profile</CardTitle>
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
                min={1}
                max={120}
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
