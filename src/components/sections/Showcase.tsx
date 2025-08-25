import Image from "next/image";
import showcase from "@/assets/showcase.png"

export default function Showcase() {
  return (
    <section id="showcase" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <div className="relative w-full h-80 lg:h-[420px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-100 via-transparent to-indigo-50 blur-xl"></div>
          <Image
            src={showcase} // 👉 replace with real asset
            alt="Event showcase"
            fill
            className="object-contain relative z-10"
          />
        </div>

        {/* Text */}
        <div className="text-center lg:text-left">
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700">
            Eventify in Action
          </span>
          <h2 className="mt-4 text-4xl font-bold text-gray-900 leading-tight">
            Bring Your <span className="text-indigo-600">Events</span> to Life
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Eventify transforms the way you host and experience events. From
            small gatherings to large-scale conferences, our platform makes it
            easy to create, manage, and showcase events in one place.
          </p>
          <p className="mt-3 text-lg text-gray-600">
            Share stunning visuals, send real-time updates, and keep your
            audience engaged every step of the way. Whether you’re an organizer
            looking to simplify management or a participant seeking seamless
            interaction, Eventify delivers a smooth and enjoyable experience for
            everyone.
          </p>
          <a
            href="#roles"
            className="mt-8 inline-block rounded-xl bg-indigo-600 px-8 py-3 text-white font-semibold hover:bg-indigo-700 shadow-md transition"
          >
            Start Hosting
          </a>
        </div>
      </div>
    </section>
  );
}
