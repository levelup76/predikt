import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AdminDashboard from "@/components/admin/dashboard";

export default async function EventAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select(`
        *,
        markets(*),
        predictions(
            id, 
            user_id, 
            points, 
            picks_json, 
            profiles(full_name, username, avatar_url)
        )
    `)
    .eq("slug", slug)
    .single();

  if (!event) {
    notFound();
  }

  // Security Check: Only Creator or Admin can access
  // Note: is_admin check would be good too, but for now strict creator check
  if (event.creator_id !== user.id) {
    return (
        <div className="container mx-auto py-20 text-center">
            <h1 className="text-2xl font-bold text-red-600">Hozzáférés megtagadva</h1>
            <p className="text-gray-500">Csak az esemény létrehozója láthatja ezt az oldalt.</p>
            <Link href={`/e/${slug}`} className="mt-4 inline-block text-blue-600 hover:underline">
                Visszahoz a publikus oldalra
            </Link>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href={`/e/${slug}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Vissza az eseményhez
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Esemény Kezelése (Admin)</h1>
        <div className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-mono">
            {event.id}
        </div>
      </div>

      <AdminDashboard event={event} />
    </div>
  );
}
