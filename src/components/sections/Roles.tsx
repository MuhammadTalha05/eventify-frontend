import { Users, Calendar } from "lucide-react";

export default function Roles() {
  const roles = [
    {
      title: "Participant",
      icon: <Users className="h-8 w-8 text-white" />,
      desc: "Join exciting events, connect with others, and enjoy seamless participation.",
      color: "bg-pink-500",
    },
    {
      title: "Organizer",
      icon: <Calendar className="h-8 w-8 text-white" />,
      desc: "Create, host, and manage your events with powerful tools and dashboards.",
      color: "bg-indigo-600",
    },
  ];

  return (
    <section id="roles" className="py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Role</h2>
        <p className="mt-4 text-lg text-gray-600">Two simple ways to use Eventify.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {roles.map((role, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition transform hover:-translate-y-2 text-center"
            >
              <div
                className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full ${role.color} shadow-lg`}
              >
                {role.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{role.title}</h3>
              <p className="mt-3 text-gray-600">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
