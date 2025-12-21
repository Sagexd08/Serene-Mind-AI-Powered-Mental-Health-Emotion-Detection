"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakCounter() {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const lastCheckIn = localStorage.getItem('serene_last_checkin');
        const currentStreak = Number(localStorage.getItem('serene_streak') || 0);

        const today = new Date().toDateString();

        if (lastCheckIn === today) {
            setStreak(currentStreak);
        } else if (lastCheckIn) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastCheckIn === yesterday.toDateString()) {
                setStreak(currentStreak); // Streak continues but haven't checked in today yet
            } else {
                setStreak(0); // Streak broken
            }
        }
    }, []);

    if (streak === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 px-3 py-1.5 rounded-full shadow-sm text-sm font-medium border border-orange-200"
        >
            <Flame size={16} className="fill-orange-500 animate-pulse" />
            <span>{streak} Day Streak</span>
        </motion.div>
    );
}

// Utility to update streak (call this on successful check-in)
export const updateStreak = () => {
    const lastCheckIn = localStorage.getItem('serene_last_checkin');
    const today = new Date().toDateString();

    if (lastCheckIn !== today) {
        let currentStreak = Number(localStorage.getItem('serene_streak') || 0);

        // Determine if consecutive
        if (lastCheckIn) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastCheckIn === yesterday.toDateString()) {
                currentStreak += 1;
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }

        localStorage.setItem('serene_streak', currentStreak.toString());
        localStorage.setItem('serene_last_checkin', today);
        return currentStreak;
    }
    return Number(localStorage.getItem('serene_streak') || 1);
};
