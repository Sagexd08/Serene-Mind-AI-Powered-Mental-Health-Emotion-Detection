"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreathingExercise() {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(4); // Start with inhale duration

    useEffect(() => {
        if (!isActive) return;

        let interval: NodeJS.Timeout;
        const tick = () => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Transition phase
                    if (phase === 'inhale') {
                        setPhase('hold');
                        return 4; // Hold duration
                    } else if (phase === 'hold') {
                        setPhase('exhale');
                        return 6; // Exhale duration
                    } else {
                        setPhase('inhale');
                        return 4; // Inhale duration
                    }
                }
                return prev - 1;
            });
        };

        interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [isActive, phase]);

    // Derived Visual Properties
    const getScale = () => {
        if (!isActive) return 1;
        if (phase === 'inhale') return 1.5; // Expanding
        if (phase === 'hold') return 1.5; // Stay expanded
        return 1; // Contracting
    };

    const getText = () => {
        if (!isActive) return "Start Breathing";
        if (phase === 'inhale') return "Inhale...";
        if (phase === 'hold') return "Hold...";
        return "Exhale...";
    };

    const getColors = () => {
        if (phase === 'inhale') return "from-cyan-100 to-blue-200 border-blue-300";
        if (phase === 'hold') return "from-blue-200 to-indigo-300 border-indigo-400";
        return "from-indigo-200 to-purple-200 border-purple-300";
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white/30 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl">
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer Glow Ring */}
                <motion.div
                    animate={{ scale: getScale(), opacity: isActive ? 0.6 : 0.2 }}
                    transition={{ duration: phase === 'inhale' || phase === 'exhale' ? (phase === 'exhale' ? 6 : 4) : 0 }}
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${getColors()} blur-2xl`}
                />

                {/* Main Circle */}
                <motion.div
                    animate={{ scale: getScale() }}
                    transition={{ duration: phase === 'inhale' || phase === 'exhale' ? (phase === 'exhale' ? 6 : 4) : 0, ease: "easeInOut" }}
                    className={`relative z-10 w-32 h-32 rounded-full bg-gradient-to-br ${getColors()} border-4 flex items-center justify-center shadow-lg`}
                >
                    <span className="text-xl font-bold text-gray-700">{Math.ceil(timeLeft)}</span>
                </motion.div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">{getText()}</h3>
            <p className="text-gray-500 mb-6 text-center text-sm max-w-xs">
                Follow the rhythm: Inhale (4s), Hold (4s), Exhale (6s)
            </p>

            <button
                onClick={() => {
                    setIsActive(!isActive);
                    if (!isActive) {
                        setPhase('inhale');
                        setTimeLeft(4);
                    }
                }}
                className={`px-8 py-3 rounded-full font-medium transition-all ${isActive
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    }`}
            >
                {isActive ? "Stop" : "Begin Exercise"}
            </button>
        </div>
    );
}
