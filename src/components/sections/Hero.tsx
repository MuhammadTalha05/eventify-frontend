import Image from "next/image"
import hero from "@/assets/hero.png"

export default function Hero() {
  return (
    <section className="bg-indigo-600 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left: Text */}
        <div className="flex-1 text-center lg:text-left">
          {/* Highlight Badge */}
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700">
            All-in-One Event Management
          </span>

          <h1 className="mt-4 text-4xl lg:text-5xl font-bold leading-snug">
            Manage & Join Events Effortlessly with Eventify
          </h1>

          <p className="mt-6 text-base lg:text-lg text-gray-100 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Eventify makes hosting and joining events simple. 
            Organizers can create and manage with ease, while 
            participants discover and register in just a few clicks.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
            <a
              href="#get-started"
              className="px-6 py-3 rounded-lg bg-white text-indigo-600 font-semibold shadow hover:bg-gray-100 transition transform"
            >
              Get Started
            </a>
            <a
              href="#learn-more"
              className="px-6 py-3 rounded-lg border border-white text-white font-medium hover:bg-white hover:text-indigo-600 transition transform "
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right: Image */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <Image
            src={hero}
            alt="Event illustration"
            width={500}
            height={400}
            className="rounded-xl"
          />
        </div>
      </div>
    </section>
  )
}
