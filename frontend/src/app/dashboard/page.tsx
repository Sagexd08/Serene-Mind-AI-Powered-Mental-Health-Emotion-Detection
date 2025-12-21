"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
    Activity, Calendar, TrendingUp, TrendingDown,
    BarChart3, PieChart, Info, Download, Trash2, Shield
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import PageTransition from '@/components/PageTransition';
import { config } from '@/config';

const MOCK_DATA = [
    { date: 'Mon', score: 65, valence: 0.4 },
    { date: 'Tue', score: 59, valence: 0.5 },
    { date: 'Wed', score: 80, valence: 0.2 },
    { date: 'Thu', score: 81, valence: 0.3 },
    { date: 'Fri', score: 56, valence: 0.6 },
    { date: 'Sat', score: 55, valence: 0.8 },
    { date: 'Sun', score: 40, valence: 0.9 },
];

export default function Dashboard() {
    const userId = useAnonymousUser();
    const [data, setData] = useState(MOCK_DATA); // In real app, fetch from API
    const [isLoading, setIsLoading] = useState(false);

    // Data Sovereignty Handlers
    const handleDownloadData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ userId, history: data }));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "serene_mind_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleWipeData = () => {
        if (confirm("⚠️ NUCLEAR OPTION ⚠️\n\nThis will permanently delete your local identity and all associated data. This action cannot be undone.\n\nAre you sure?")) {
            localStorage.clear();
            window.location.href = "/";
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50/50 pb-20 pt-24 px-4">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Journey</h1>
                            <p className="text-gray-500">Understanding your emotional trends over time.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleDownloadData} className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors" title="Export Data">
                                <Download size={20} />
                            </button>
                            <button onClick={handleWipeData} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete All Data">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Chart Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="text-blue-500" /> Emotional Valence
                            </h2>
                            <div className="flex gap-2">
                                <span className="text-xs font-semibold px-3 py-1 bg-gray-100 rounded-full text-gray-600">Weekly</span>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValence" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis hide domain={[0, 1]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="valence"
                                        stroke="#8884d8"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValence)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Grid Stats */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Average Mood"
                            value="Calm"
                            icon={TrendingUp}
                            color="bg-emerald-100 text-emerald-700"
                            delay={0.2}
                        />
                        <StatCard
                            title="Check-in Streak"
                            value="5 Days"
                            icon={Calendar}
                            color="bg-orange-100 text-orange-700"
                            delay={0.3}
                        />
                        <StatCard
                            title="Risk Level"
                            value="Low"
                            icon={Shield}
                            color="bg-blue-100 text-blue-700"
                            delay={0.4}
                        />
                    </div>

                    {/* Volatility / Risk Chart Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <BarChart3 className="text-purple-500" /> Stress Volatility
                            </h2>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Line
                                        type="step"
                                        dataKey="score"
                                        stroke="#c084fc"
                                        strokeWidth={3}
                                        dot={{ fill: '#c084fc', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
}

function StatCard({ title, value, icon: Icon, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}
