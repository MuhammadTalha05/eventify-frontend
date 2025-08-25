"use client"
import { Facebook, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">Eventify</h2>
          <p className="mt-4 text-sm leading-relaxed">
            Eventify is your all-in-one platform to create, manage, 
            and join events effortlessly. Designed for organizers and 
            participants alike, making events seamless and engaging.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/#whychoose" className="hover:text-white">Why Eventify</Link></li>
            <li><Link href="/#howitworks" className="hover:text-white">How It Works</Link></li>
            <li><Link href="/#showcase" className="hover:text-white">Showcase</Link></li>
            <li><Link href="/#cta" className="hover:text-white">Get Started</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-white">Support</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white">Help Center</Link></li>
            <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-lg font-semibold text-white">Follow Us</h3>
          <div className="mt-4 flex gap-4">
            <a href="#" className="hover:text-white"><Facebook size={20} /></a>
            <a href="#" className="hover:text-white"><Twitter size={20} /></a>
            <a href="#" className="hover:text-white"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm">
        © {new Date().getFullYear()} Eventify. All rights reserved.
      </div>
    </footer>
  )
}
