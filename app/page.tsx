import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

export default function Home() {
  const events = [
    {
      id: "oscar-2026",
      title: "98. Oscar-gála (2026)",
      description: "Kik viszik haza az aranyszobrokat? Tippelj a főbb kategóriákra!",
      date: "2026. márc. 10.",
      status: "open",
    },
    {
      id: "f1-bahrain",
      title: "F1 Bahreini Nagydíj",
      description: "Indul a 2026-os szezon! Ki nyeri az évadnyitót?",
      date: "2026. márc. 2.",
      status: "open",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Tippelj. Oszd meg. Dicsekedj.</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Ingyenes közösségi tippjáték az Oscar-tól a Bajnokok Ligájáig.
          Hívd ki a barátaidat és mutasd meg, ki a nagyobb jós!
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Aktív Események</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/e/${event.id}`}
              className="block group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  {event.date}
                  <span className="mx-2">•</span>
                  <span className="uppercase text-xs font-semibold tracking-wider text-green-600 dark:text-green-400">
                    Nyitva
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {event.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {event.description}
                </p>
                <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                  Tippelés indítása <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
