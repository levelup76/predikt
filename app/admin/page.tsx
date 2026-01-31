
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { deleteEventAdminAction, toggleUserBanAction } from "../actions";

export default async function SuperAdminPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    // Check if user is super admin
    const ADMIN_EMAILS = ["levelup.production@gmail.com", "levelup@levelup.hu"];
    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        return redirect("/");
    }

    // Fetch all events
    const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

    // Fetch all reports (if table exists)
    const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

    
    // Create profiles map for fast lookup
    const profilesMap = new Map();
    profiles?.forEach((p: any) => {
        profilesMap.set(p.id, p);
    });

    // Enrich reports with event data
    const reports = reportsData?.map((r: any) => ({
        ...r,
        event: events?.find((e: any) => e.id === r.event_id)
    })) || [];


    return (
        <div className="container max-w-6xl py-12">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Reports Section */}
            <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Bejelentések ({reports.length})</h2>
                {reports.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Esemény</th>
                                    <th className="px-6 py-3">Ok</th>
                                    <th className="px-6 py-3">Leírás</th>
                                    <th className="px-6 py-3">Státusz</th>
                                    <th className="px-6 py-3">Dátum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report: any) => (
                                    <tr key={report.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium">
                                            {report.event ? (
                                                <a href={`/e/${report.event.slug}`} target="_blank" className="text-blue-500 hover:underline">
                                                    {report.event.title}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Törölt esemény ({report.event_id})</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{report.reason}</td>
                                        <td className="px-6 py-4 truncate max-w-xs" title={report.details}>
                                            {report.details}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                report.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">Nincs új bejelentés.</p>
                )}
            </div>

            {/* Events Section */}
            <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Összes Esemény ({events?.length || 0})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Cím</th>
                                <th scope="col" className="px-6 py-3">Szervező</th>
                                <th scope="col" className="px-6 py-3">Dátum</th>
                                <th scope="col" className="px-6 py-3">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {events?.map((event: any) => {
                                const creator = profilesMap.get(event.creator_id);
                                return (
                                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <a href={`/e/${event.slug}`} target="_blank" className="hover:underline">
                                                {event.title}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            {creator ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {creator.full_name || 'Névtelen'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {creator.email}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Ismeretlen</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(event.created_at).toLocaleDateString("hu-HU")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <form action={deleteEventAdminAction}>
                                                    <input type="hidden" name="id" value={event.id} />
                                                    <button 
                                                        type="submit"
                                                        className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                                    >
                                                        Törlés
                                                    </button>
                                                </form>
                                                {creator && (
                                                    <form action={toggleBanAction}>
                                                        <input type="hidden" name="userId" value={creator.id} />
                                                        <button 
                                                            type="submit"
                                                            className={`font-medium ml-2 ${creator.is_banned ? 'text-green-600 hover:text-green-500' : 'text-orange-600 hover:text-orange-500'} hover:underline`}
                                                        >
                                                            {creator.is_banned ? 'Unban' : 'Ban'}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
