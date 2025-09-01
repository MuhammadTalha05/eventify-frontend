export default function HowItWorks() {
  const steps = [
    { step: "1", title: "Sign Up", desc: "Join Eventify as an Organizer or Participant." },
    { step: "2", title: "Create / Join", desc: "Organizers host events. Participants explore and join." },
    { step: "3", title: "Engage", desc: "Interact, collaborate, and enjoy real-time event updates." },
  ];

  return (
    <section id="howitworks" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Highlight Badge */}
        <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700">
          Quick & Easy Process
        </span>

        {/* Heading */}
        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          How <span className="text-indigo-600">Eventify</span> Works
        </h2>

        {/* Subtext */}
        <p className="mt-4 text-lg text-gray-600">
          A simple and seamless process to make event hosting & participation effortless.
        </p>

        {/* Steps */}
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-gray-50 shadow hover:shadow-lg transition transform hover:-translate-y-2"
            >
              {/* Step Number Circle */}
              <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl font-bold shadow-md">
                {s.step}
              </div>

              {/* Content */}
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-3 text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
