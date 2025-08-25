export default function CTA() {
  return (
    <section id="cta" className="py-20 bg-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        {/* Highlight */}
        <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700">
          Don’t Miss Out
        </span>

        {/* Heading */}
        <h2 className="mt-4 text-4xl font-bold text-gray-900 leading-tight">
          Ready to <span className="text-indigo-600">Experience Eventify?</span>
        </h2>

        {/* Subtext */}
        <p className="mt-4 text-lg text-gray-600">
          Sign up today and unlock powerful tools to create, manage, and enjoy
          unforgettable events — all in one platform.
        </p>

        {/* CTA Button */}
        <a
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-indigo-600 px-10 py-4 text-lg text-white font-semibold shadow-lg hover:bg-indigo-700 shadow-md transition"
        >
          Get Started
        </a>

        {/* Extra Line */}
        <p className="mt-4 text-sm text-gray-500">
          It only takes a minute to sign up. No credit card required.
        </p>
      </div>
    </section>
  );
}
