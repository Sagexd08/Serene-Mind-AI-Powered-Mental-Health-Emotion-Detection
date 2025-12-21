"use client";

import Link from 'next/link';
import { Heart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StreakCounter from './StreakCounter';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled || isOpen ? 'glass-card border-b border-white/20' : 'bg-transparent border-transparent'
                }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2.5 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                            <Heart className="text-blue-600 w-6 h-6 fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-800 group-hover:text-blue-600 transition-colors">SereneMind</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink href="/check-in">Check In</NavLink>
                        <NavLink href="/dashboard">My Journey</NavLink>
                        <NavLink href="/resources">Resources</NavLink>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <StreakCounter />
                        <Link href="/check-in" className="relative group overflow-hidden bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                            <span className="relative z-10 flex items-center gap-2">Begin Session</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100/50 transition-colors">
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-panel border-t border-white/20 overflow-hidden"
                    >
                        <div className="px-4 py-6 flex flex-col gap-4">
                            <MobileNavLink href="/check-in" onClick={() => setIsOpen(false)}>Check In</MobileNavLink>
                            <MobileNavLink href="/dashboard" onClick={() => setIsOpen(false)}>My Journey</MobileNavLink>
                            <MobileNavLink href="/resources" onClick={() => setIsOpen(false)}>Resources</MobileNavLink>
                            <div className="pt-4 border-t border-gray-100/20">
                                <StreakCounter />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group">
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 rounded-full group-hover:w-full transition-all duration-300 opacity-50" />
        </Link>
    );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="text-lg font-medium text-gray-800 p-2 rounded-xl hover:bg-white/50 transition-colors"
        >
            {children}
        </Link>
    );
}
