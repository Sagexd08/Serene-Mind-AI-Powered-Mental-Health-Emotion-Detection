"use client";

import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { BookOpen, Phone, MessageCircle, ExternalLink, Coffee, Wind, Moon } from 'lucide-react';
import BreathingExercise from '@/components/BreathingExercise';

export default function Resources() {
    useAnonymousUser();

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-calm pb-20 pt-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">You are not alone.</h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Whether you need immediate help or just a moment of calm, we've currated these resources for you.
                        </p>
                    </motion.div>

                    {/* Immediate Help */}
                    <div className="bg-red-50 border border-red-100 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">In Crisis?</h3>
                                <p className="text-gray-600">Immediate support is available 24/7.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <a href="tel:988" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                                Call 988 (US)
                            </a>
                            <a href="sms:988" className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors">
                                Text 988
                            </a>
                        </div>
                    </div>

                    {/* Interactive Tools */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* Breathing Exercise */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                                <Wind className="text-blue-500" />
                                <h2 className="text-xl font-bold text-gray-800">Box Breathing</h2>
                            </div>
                            <div className="p-8 flex justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                                <BreathingExercise />
                            </div>
                        </motion.div>

                        {/* Grounding Tips */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl shadow-lg border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                                <Coffee className="text-amber-500" />
                                <h2 className="text-xl font-bold text-gray-800">5-4-3-2-1 Grounding</h2>
                            </div>
                            <ul className="p-8 space-y-4">
                                <li className="flex gap-4 items-center text-gray-600">
                                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">5</span>
                                    Things you can see
                                </li>
                                <li className="flex gap-4 items-center text-gray-600">
                                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">4</span>
                                    Things you can feel
                                </li>
                                <li className="flex gap-4 items-center text-gray-600">
                                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">3</span>
                                    Things you can hear
                                </li>
                                <li className="flex gap-4 items-center text-gray-600">
                                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">2</span>
                                    Things you can smell
                                </li>
                                <li className="flex gap-4 items-center text-gray-600">
                                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">1</span>
                                    Thing you can taste
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Article Cards Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <ResourceCard
                            icon={Moon}
                            title="Sleep and Mental Health"
                            description="Why rest is the foundation of emotional stability."
                            delay={0.1}
                        />
                        <ResourceCard
                            icon={BookOpen}
                            title="Journaling for Clarity"
                            description="How writing down your thoughts reduces anxiety."
                            delay={0.2}
                        />
                        <ResourceCard
                            icon={MessageCircle}
                            title="Finding a Therapist"
                            description="A guide to finding the right professional for you."
                            delay={0.3}
                        />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

function ResourceCard({ icon: Icon, title, description, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform cursor-pointer group"
        >
            <div className="mb-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                <Icon size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            <div className="flex items-center text-blue-600 text-sm font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Read Article <ExternalLink size={14} />
            </div>
        </motion.div>
    );
}
