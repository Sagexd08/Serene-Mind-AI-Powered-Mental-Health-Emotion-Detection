"use client";

import { Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const mockHistory = [
    { date: 'Today', emotion: 'calm', score: 85 },
    { date: 'Yesterday', emotion: 'anxiety', score: 60 },
    { date: 'Mon', emotion: 'joy', score: 92 },
    { date: 'Sun', emotion: 'sadness', score: 45 },
];

export default function Dashboard() {
    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Journey</h1>

            {/* Risk Score Card */}
            <div className="glass-card p-8 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">Weekly Risk Assessment</h2>
                        <p className="text-gray-500 max-w-md">Your emotional volatility is low this week. You are doing a great job maintaining balance.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-sm text-gray-500 uppercase tracking-wide">Risk Level</span>
                            <p className="text-2xl font-bold text-green-500">Low Risk</p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center text-green-600 font-bold bg-white">
                            12%
                        </div>
                    </div>
                </div>
            </div>

            {/* History Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" /> Recent Entries
                    </h3>
                    <div className="space-y-4">
                        {mockHistory.map((entry, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl
                    ${entry.emotion === 'calm' ? 'bg-green-100' :
                                            entry.emotion === 'joy' ? 'bg-yellow-100' :
                                                entry.emotion === 'anxiety' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                        {entry.emotion === 'calm' ? '🍃' :
                                            entry.emotion === 'joy' ? '😊' :
                                                entry.emotion === 'anxiety' ? '⚡' : '💙'}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 capitalize">{entry.emotion}</h4>
                                        <span className="text-xs text-gray-400">{entry.date}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium text-gray-600">{entry.score}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Resources Recommendation */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-500" /> Recommended For You
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-800 mb-1">Guided Breathing</h4>
                            <p className="text-sm text-blue-600 mb-3">3 min • Audio</p>
                            <button className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold">Start</button>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <h4 className="font-bold text-purple-800 mb-1">Sleep Hygiene 101</h4>
                            <p className="text-sm text-purple-600 mb-3">5 min • Article</p>
                            <button className="text-xs bg-purple-200 text-purple-800 px-3 py-1 rounded-full font-bold">Read</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
