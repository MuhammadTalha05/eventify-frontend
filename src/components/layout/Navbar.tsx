"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/authStore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const authStore = useAuthStore.getState();
      // if (authStore.user) {
      //   await authStore.refreshAccessToken();
      // }
      setReady(true);
    };
    initAuth();
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Why Eventify", href: "/#whychoose" },
    { name: "How It Works", href: "/#howitworks" },
    { name: "Showcase", href: "/#showcase" },
    { name: "Events", href: "/events" },
  ];

  // Improved helper: check if active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" && !activeLink.includes("#");
    }
    
    if (href.startsWith("/#")) {
      // For hash links, check if the current active link matches exactly
      return activeLink === href;
    }
    
    // For regular paths, check if the pathname starts with the href
    return pathname.startsWith(href);
  };

  const handleDashboardRedirect = () => {
    if (!user) return;
    switch (user.role) {
      case "PARTICIPANT":
        router.push("/participant/dashboard");
        setActiveLink("/participant/dashboard");
        break;
      case "ORGANIZER":
        router.push("/organizer/dashboard");
        setActiveLink("/organizer/dashboard");
        break;
      case "SUPER_ADMIN":
        router.push("/super-admin/dashboard");
        setActiveLink("/super-admin/dashboard");
        break;
    }
    setDropdownOpen(false);
    setIsOpen(false);
  };

  const handleProfileRedirect = () => {
    if (!user) return;
    const profilePath = `/profile/${user.id}`;
    router.push(profilePath);
    setActiveLink(profilePath);
    setDropdownOpen(false);
    setIsOpen(false);
  };

  const handleUpdatePassword = () => {
    if (!user) return;
    const passwordPath = `/profile/${user.id}/password`;
    router.push(passwordPath);
    setActiveLink(passwordPath);
    setDropdownOpen(false);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await clearAuth();
    setDropdownOpen(false);
    setIsOpen(false);
    router.push("/");
    setActiveLink("/");
  };

  const handleNavLinkClick = (href: string) => {
    setActiveLink(href);
    setIsOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
        <Link 
          href="/" 
          className="text-2xl font-bold text-indigo-600"
          onClick={() => handleNavLinkClick("/")}
        >
          Eventify
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition ${
                isActive(link.href)
                  ? "text-indigo-600 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
              onClick={() => handleNavLinkClick(link.href)}
            >
              {link.name}
            </Link>
          ))}

          {ready ? (
            !user ? (
              <Link
                href="/auth?mode=login"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user.avatarUrl ? (
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500 overflow-hidden shadow-sm">
                      <Image
                        src={user.avatarUrl}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-indigo-500 shadow-sm bg-indigo-100 text-indigo-600 font-semibold">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <ChevronDown size={18} className="text-gray-700" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={handleDashboardRedirect}
                      className={`w-full text-left px-4 py-2 transition ${
                        activeLink.includes("dashboard") 
                          ? "bg-gray-100 font-semibold text-indigo-600" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleProfileRedirect}
                      className={`w-full text-left px-4 py-2 transition ${
                        activeLink.startsWith("/profile/") && !activeLink.endsWith("password")
                          ? "bg-gray-100 font-semibold text-indigo-600"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleUpdatePassword}
                      className={`w-full text-left px-4 py-2 transition ${
                        activeLink.endsWith("password")
                          ? "bg-gray-100 font-semibold text-indigo-600"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      Update Password
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="w-36 h-10 bg-gray-100 rounded-lg animate-pulse" />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-50">
          <div className="flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`transition font-medium ${
                  isActive(link.href)
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
                onClick={() => handleNavLinkClick(link.href)}
              >
                {link.name}
              </Link>
            ))}

            {ready && (
              <>
                {user ? (
                  <>
                    <button
                      onClick={handleDashboardRedirect}
                      className={`text-left transition font-medium ${
                        activeLink.includes("dashboard")
                          ? "text-indigo-600 font-semibold"
                          : "text-gray-700 hover:text-indigo-600"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleProfileRedirect}
                      className={`text-left transition font-medium ${
                        activeLink.startsWith("/profile/") && !activeLink.endsWith("password")
                          ? "text-indigo-600 font-semibold"
                          : "text-gray-700 hover:text-indigo-600"
                      }`}
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleUpdatePassword}
                      className={`text-left transition font-medium ${
                        activeLink.endsWith("password")
                          ? "text-indigo-600 font-semibold"
                          : "text-gray-700 hover:text-indigo-600"
                      }`}
                    >
                      Update Password
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-left transition font-medium text-gray-700 hover:text-indigo-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth?mode=login"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}