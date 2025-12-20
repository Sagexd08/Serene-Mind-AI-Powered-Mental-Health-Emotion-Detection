"use client";

import { Phone, MessageCircle, Globe, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Resources() {
    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Support & Resources</h1>

            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="bg-white p-4 rounded-full shadow-sm text-red-500">
                    <Phone className="w-8 h-8" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">In Crisis? Talk to a Human generally.</h2>
                    <p className="text-red-700 mb-4">You are not alone. Support is available 24/7, free and confidential.</p>
                    <div className="flex gap-4 flex-wrap">
                        <a href="tel:988" className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
                            Call 988 (USA)
                        </a>
                        <a href="sms:988" className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-full font-bold hover:bg-red-50 transition-colors">
                            Text 988
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {[
                    { icon: <Globe className="w-6 h-6 text-blue-500" />, title: "Find a Therapist", desc: "Search for licensed professionals in your area.", link: "https://www.psychologytoday.com/us" },
                    { icon: <MessageCircle className="w-6 h-6 text-green-500" />, title: "Peer Support", desc: "Join anonymous forums and chat groups.", link: "#" },
                    { icon: <Heart className="w-6 h-6 text-purple-500" />, title: "Self-Care Guide", desc: "Daily routine building for mental resilience.", link: "#" },
                ].map((r, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 hover:shadow-xl transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {r.icon}
                            <h3 className="text-lg font-bold text-gray-800">{r.title}</h3>
                        </div>
                        <p className="text-gray-500 mb-4">{r.desc}</p>
                        <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold hover:underline">
                            Open Resource &rarr;
                        </a>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
