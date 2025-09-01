import { Calendar, Users, Bell } from "lucide-react"

export default function WhyChoose() {
  const features = [
    {
      icon: <Calendar className="w-10 h-10 text-indigo-600 mx-auto mb-4" />,
      title: "Seamless Event Creation",
      desc: "Organizers can create events in minutes with an intuitive dashboard.",
    },
    {
      icon: <Users className="w-10 h-10 text-indigo-600 mx-auto mb-4" />,
      title: "Easy Participation",
      desc: "Participants can discover and join events with a single click.",
    },
    {
      icon: <Bell className="w-10 h-10 text-indigo-600 mx-auto mb-4" />,
      title: "Real-Time Updates",
      desc: "Stay connected with instant notifications and event updates.",
    },
  ]

  return (
    <section id="whychoose" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        
        {/* Highlight Badge */}
        <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700">
          Why Eventify Stands Out
        </span>

        {/* Heading */}
        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          Why Choose <span className="text-indigo-600">Eventify?</span>
        </h2>

        {/* Subtext */}
        <p className="mt-4 text-lg text-gray-600">
          Designed to make event hosting and participation smooth and engaging.
        </p>

        {/* Features */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition transform hover:-translate-y-2"
            >
              {f.icon}
              <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-3 text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
