"use client";

import { motion } from 'framer-motion';
import { Cloud, Heart, Zap, Smile, Activity, Moon, Sun } from 'lucide-react';

interface EmotionOrbProps {
    emotion: string;
    confidence: number;
    size?: 'sm' | 'md' | 'lg';
}

const EMOTION_CONFIG: Record<string, { colors: string[]; icon: any; speed: number }> = {
    joy: { colors: ['#fef9c3', '#fde047', '#fbbf24'], icon: Sun, speed: 2 },
    happy: { colors: ['#fef9c3', '#fde047', '#fbbf24'], icon: Smile, speed: 2 },
    sadness: { colors: ['#dbeafe', '#60a5fa', '#3b82f6'], icon: Cloud, speed: 6 },
    sad: { colors: ['#dbeafe', '#60a5fa', '#3b82f6'], icon: Cloud, speed: 6 },
    anger: { colors: ['#fee2e2', '#f87171', '#ef4444'], icon: Zap, speed: 0.5 },
    angry: { colors: ['#fee2e2', '#f87171', '#ef4444'], icon: Zap, speed: 0.5 },
    fear: { colors: ['#f3e8ff', '#c084fc', '#9333ea'], icon: Moon, speed: 1 },
    fearful: { colors: ['#f3e8ff', '#c084fc', '#9333ea'], icon: Moon, speed: 1 },
    neutral: { colors: ['#f3f4f6', '#9ca3af', '#6b7280'], icon: Activity, speed: 4 },
    calm: { colors: ['#ccfbf1', '#5eead4', '#14b8a6'], icon: Heart, speed: 5 },
};

export default function EmotionOrb({ emotion, confidence, size = 'md' }: EmotionOrbProps) {
    const config = EMOTION_CONFIG[emotion.toLowerCase()] || EMOTION_CONFIG['neutral'];

    // Normalize size
    const sizeClasses = {
        sm: 'w-24 h-24',
        md: 'w-48 h-48',
        lg: 'w-72 h-72'
    }[size];

    return (
        <div className={`relative ${sizeClasses} flex items-center justify-center`}>
            {/* Background Blob 1 */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 180, 270, 360],
                    borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
                }}
                transition={{
                    duration: 10 + (10 / config.speed), // Slower for sad/calm, faster for anger
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute inset-0 opacity-60 mix-blend-multiply filter blur-2xl"
                style={{ backgroundColor: config.colors[0] }}
            />

            {/* Background Blob 2 */}
            <motion.div
                animate={{
                    scale: [1.1, 0.9, 1.1],
                    rotate: [360, 270, 180, 90, 0],
                    borderRadius: ["50% 50% 50% 70% / 50% 50% 70% 60%", "80% 20% 40% 60% / 60% 30% 70% 40%", "50% 50% 50% 70% / 50% 50% 70% 60%"]
                }}
                transition={{
                    duration: 8 + (8 / config.speed),
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute inset-2 flow-root opacity-60 mix-blend-multiply filter blur-xl"
                style={{ backgroundColor: config.colors[1] }}
            />

            {/* Core Icon */}
            <div className="relative z-10 flex flex-col items-center justify-center text-white drop-shadow-md">
                <config.icon size={size === 'sm' ? 24 : size === 'md' ? 48 : 64} strokeWidth={1.5} />
                {size !== 'sm' && <span className="mt-2 font-medium opacity-90">{emotion}</span>}
            </div>
        </div>
    );
}
