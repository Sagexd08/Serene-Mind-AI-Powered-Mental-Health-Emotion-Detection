"use client";

import Link from 'next/link';
import { Heart, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full glass-card rounded-none border-b border-white/20 px-6 py-4">
            <div className="mx-auto max-w-6xl flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Heart className="text-blue-500 w-6 h-6 fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-800">SereneMind</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/check-in" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">Check In</Link>
                    <Link href="/dashboard" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">My Journey</Link>
                    <Link href="/resources" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">Resources</Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link href="/check-in" className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-blue-200 transition-all text-sm">
                        Start Check-In
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600">
                    <Menu />
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b p-4 flex flex-col gap-4 shadow-xl">
                    <Link href="/check-in" className="text-gray-700 p-2">Check In</Link>
                    <Link href="/dashboard" className="text-gray-700 p-2">My Journey</Link>
                    <Link href="/resources" className="text-gray-700 p-2">Resources</Link>
                </div>
            )}
        </nav>
    );
}

