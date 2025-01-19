"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import LottieLogo from './LottieLogo';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center">
                <LottieLogo />
                <span className="ml-2 font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  AI Studio
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Contact
            </Link>

            {/* Conditional rendering for Login/User Profile */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-sm text-gray-500">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-black text-white hover:bg-gray-800 transition-colors px-4 py-2 rounded-full text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200">
          <Link 
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Home
          </Link>
          <Link 
            href="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            About
          </Link>
          <Link 
            href="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Contact
          </Link>
          {session ? (
            <>
              <div className="px-3 py-2 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-sm text-gray-500">{session.user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="mt-2 block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="mt-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          ) : (
            <Link 
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium bg-black text-white hover:bg-gray-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 