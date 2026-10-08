"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface LMSNotification {
  id: string;
  user_id?: string;
  title: string;
  body: string;
  link?: string;
  read_at: string | null;
  created_at: string;
}

export async function getUserNotifications(): Promise<LMSNotification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Fetch from database lms_notifications
  const { data, error } = await supabase
    .from("lms_notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) {
    // Return initial default notifications for seamless experience
    return [
      {
        id: "default-1",
        title: "Welcome to Learn Charan Organics! 🎉",
        body: "Welcome to our learning platform! Join our community groups to learn and interact with mentors.",
        link: "/community",
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      },
      {
        id: "default-2",
        title: "Community Announcement 💬",
        body: "You are automatically enrolled in the Welcome Group. Check out ongoing discussions!",
        link: "/community",
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: "default-3",
        title: "Explore Premium Courses 📚",
        body: "Browse our organic farming and technology courses to boost your knowledge.",
        link: "/courses",
        read_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];
  }

  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (notificationId.startsWith("default-")) {
    return { success: true };
  }

  const { error } = await supabase
    .from("lms_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("lms_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function notifyAllUsersNewCourse(courseTitle: string, courseSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify admin
  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can send course notifications." };
  }

  // Get all registered users from lms_profiles
  const { data: profiles } = await supabase.from("lms_profiles").select("id");

  if (!profiles || profiles.length === 0) return { success: true };

  const notifications = profiles.map((p) => ({
    user_id: p.id,
    title: "New Course Released! 🎓",
    body: `Check out our new course: "${courseTitle}". Start learning today!`,
    link: `/courses/${courseSlug}`,
    read_at: null,
  }));

  const { error } = await supabase.from("lms_notifications").insert(notifications);

  if (error) {
    console.error("Error sending course notifications:", error);
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
