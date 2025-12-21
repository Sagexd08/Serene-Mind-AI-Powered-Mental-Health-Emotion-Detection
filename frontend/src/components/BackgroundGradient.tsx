"use client";

import { motion } from 'framer-motion';

export default function BackgroundGradient() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gray-50/50">
            {/* Top Right - Violet/Blue */}
            <motion.div
                animate={{
                    x: [0, 50, -20, 0],
                    y: [0, -30, 20, 0],
                    scale: [1, 1.1, 0.9, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[10%] -right-[10%] w-[40vw] h-[40vw] bg-violet-200/40 rounded-full blur-[100px] mix-blend-multiply"
            />

            {/* Bottom Left - Cyan/Teal */}
            <motion.div
                animate={{
                    x: [0, -30, 20, 0],
                    y: [0, 50, -20, 0],
                    scale: [1, 1.2, 0.95, 1],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] bg-cyan-200/40 rounded-full blur-[120px] mix-blend-multiply"
            />

            {/* Center - Pink/Rose Accent */}
            <motion.div
                animate={{
                    x: [0, 40, -40, 0],
                    y: [0, -40, 40, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-rose-100/30 rounded-full blur-[80px] mix-blend-multiply"
            />

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[80px]" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
