"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/quiz", label: "Quiz", icon: "🧠" },
    { href: "/progress", label: "Progress", icon: "📊" },
  ];

  return (
    <nav className="navbar bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-800/40 dark:via-purple-800/40 dark:to-pink-800/40 backdrop-blur-xl border-b border-base-300/50 sticky top-0 z-50 shadow-md shadow-black/5">
      <div className="container mx-auto">
        <div className="navbar-center hidden lg:flex">
          <div className="flex mt-3 items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`btn btn-ghost rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                  pathname === link.href
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-md"
                }`}
              >
                <span className="text-lg mr-2 transform transition-transform duration-300 hover:scale-110">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="navbar-end">
          {/* Mobile menu */}
          <div className="dropdown dropdown-end lg:hidden">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content z-[1] p-3 shadow-xl bg-base-100/95 backdrop-blur-xl rounded-2xl w-56 border border-base-300/50"
            >
              {navLinks.map((link) => (
                <li key={link.href} className="mb-1">
                  <Link
                    href={link.href}
                    className={`rounded-xl font-medium transition-all duration-300 ${
                      pathname === link.href
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:scale-105"
                    }`}
                  >
                    <span className="text-lg mr-3 transform transition-transform duration-300 hover:scale-110">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
