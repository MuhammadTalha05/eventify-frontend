import Hero from "@/components/sections/Hero"
import WhyChoose from "@/components/sections/WhyChoose"
import Showcase from "@/components/sections/Showcase"
import CTA from "@/components/sections/CTA"
import HowItWOrks from "@/components/sections/HowItWorks"

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <WhyChoose />
      <HowItWOrks></HowItWOrks>
      <Showcase />
      <CTA />
    </main>
  )
}
