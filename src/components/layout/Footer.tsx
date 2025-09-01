"use client"
import { useState, useEffect } from "react";
import { Facebook, Twitter, Linkedin, Instagram, Mail } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Footer() {
  const [activeLink, setActiveLink] = useState("");
  const pathname = usePathname();

  // Track pathname + hash correctly
  useEffect(() => {
    const updateActiveLink = () => {
      const hash = window.location.hash || "";
      setActiveLink(pathname + hash);
    };

    updateActiveLink();
    window.addEventListener("hashchange", updateActiveLink);
    return () => window.removeEventListener("hashchange", updateActiveLink);
  }, [pathname]);

  // Helper: check if active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" && !activeLink.includes("#");
    }
    
    if (href.startsWith("/#")) {
      return activeLink === href;
    }
    
    return pathname.startsWith(href);
  };

  const handleLinkClick = (href: string) => {
    setActiveLink(href);
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-300 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {/* About Eventify */}
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Eventify
          </h2>
          <p className="text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
            Your all-in-one platform to create, manage, and join events effortlessly. 
            Making events seamless and engaging for everyone.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2 text-sm">
            <Mail size={16} className="text-indigo-400" />
            <span>support@eventify.com</span>
          </div>
        </div>

        {/* Menu Links - Single Column */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b-2 border-indigo-600 w-fit">
            Navigation
          </h3>
          <ul className="space-y-3 text-sm w-full max-w-xs">
            <li>
              <Link 
                href="/" 
                className={`transition px-3 py-2 rounded-md hover:text-white hover:bg-gray-800 block text-center md:text-left ${
                  isActive("/") ? "text-white bg-indigo-900 font-medium" : ""
                }`}
                onClick={() => handleLinkClick("/")}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/#whychoose" 
                className={`transition px-3 py-2 rounded-md hover:text-white hover:bg-gray-800 block text-center md:text-left ${
                  isActive("/#whychoose") ? "text-white bg-indigo-900 font-medium" : ""
                }`}
                onClick={() => handleLinkClick("/#whychoose")}
              >
                Why Eventify
              </Link>
            </li>
            <li>
              <Link 
                href="/#howitworks" 
                className={`transition px-3 py-2 rounded-md hover:text-white hover:bg-gray-800 block text-center md:text-left ${
                  isActive("/#howitworks") ? "text-white bg-indigo-900 font-medium" : ""
                }`}
                onClick={() => handleLinkClick("/#howitworks")}
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link 
                href="/#showcase" 
                className={`transition px-3 py-2 rounded-md hover:text-white hover:bg-gray-800 block text-center md:text-left ${
                  isActive("/#showcase") ? "text-white bg-indigo-900 font-medium" : ""
                }`}
                onClick={() => handleLinkClick("/#showcase")}
              >
                Showcase
              </Link>
            </li>
            <li>
              <Link 
                href="/events" 
                className={`transition px-3 py-2 rounded-md hover:text-white hover:bg-gray-800 block text-center md:text-left ${
                  isActive("/events") ? "text-white bg-indigo-900 font-medium" : ""
                }`}
                onClick={() => handleLinkClick("/events")}
              >
                Browse Events
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b-2 border-indigo-600 w-fit">
            Connect With Us
          </h3>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <a 
              href="#" 
              className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 group"
              aria-label="Facebook"
            >
              <Facebook size={24} className="mb-2" />
              <span className="text-xs">Facebook</span>
            </a>
            <a 
              href="#" 
              className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-blue-400 hover:text-white transition-all duration-300 group"
              aria-label="Twitter"
            >
              <Twitter size={24} className="mb-2" />
              <span className="text-xs">Twitter</span>
            </a>
            <a 
              href="#" 
              className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-blue-700 hover:text-white transition-all duration-300 group"
              aria-label="LinkedIn"
            >
              <Linkedin size={24} className="mb-2" />
              <span className="text-xs">LinkedIn</span>
            </a>
            <a 
              href="#" 
              className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-pink-600 hover:text-white transition-all duration-300 group"
              aria-label="Instagram"
            >
              <Instagram size={24} className="mb-2" />
              <span className="text-xs">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm">
        © {new Date().getFullYear()} Eventify. All rights reserved.
      </div>
    </footer>
  )
}