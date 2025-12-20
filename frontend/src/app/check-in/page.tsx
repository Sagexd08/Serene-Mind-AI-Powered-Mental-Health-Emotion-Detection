"use client";

import { useState } from 'react';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import { config } from '@/config';
import { Mic, Send, Smile, StopCircle, Activity, Zap, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmotionResult {
    emotion: string;
    confidence?: number;
    details?: Record<string, number>;
    arousal?: number;
    valence?: number;
    timestamp?: number;
    processing_time_ms?: number;
    processing_complete_ms?: number;
    [key: string]: any;
}

const EMOTION_EMOJIS: Record<string, string> = {
    anger: '😠', disgust: '🤢', fear: '😨', joy: '😊', sadness: '😢', neutral: '🤷',
    calm: '😌', happy: '😄', sad: '😞', angry: '🤬', fearful: '😱',
    disgusted: '🤮', surprised: '😲'
};

const EMOTION_COLORS: Record<string, string> = {
    anger: 'from-red-500 to-red-600', 
    disgust: 'from-green-500 to-emerald-600',
    fear: 'from-purple-500 to-purple-600',
    joy: 'from-yellow-400 to-yellow-500',
    sadness: 'from-blue-500 to-blue-600',
    neutral: 'from-gray-400 to-gray-500',
    calm: 'from-teal-400 to-teal-500',
    happy: 'from-yellow-400 to-orange-400',
    sad: 'from-indigo-500 to-blue-600',
};

export default function CheckIn() {
    const { videoRef, startStream, stopStream, stream } = useMediaStream();
    const { isRecording, audioBlob, startRecording, stopRecording } = useAudioRecorder();
    const [text, setText] = useState("");
    const [result, setResult] = useState<EmotionResult | null>(null);
    const [mode, setMode] = useState<'text' | 'face' | 'voice'>('text');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const userId = useAnonymousUser();

    const handleTextSubmit = async () => {
        if (!userId || !text.trim()) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${config.apiBaseUrl}/emotion/text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({ text, user_id: userId })
            });
            
            if (!res.ok) throw new Error('Failed to analyze emotion');
            
            const data = await res.json();
            setResult(data);
            setText("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "API Error occurred");
            console.error("API Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAudioSubmit = async () => {
        if (!audioBlob || !userId) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.wav');
            
            const res = await fetch(`${config.apiBaseUrl}/emotion/audio`, {
                method: 'POST',
                headers: { 'x-user-id': userId },
                body: formData
            });
            
            if (!res.ok) throw new Error('Failed to analyze audio');
            
            const data = await res.json();
            setResult(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Audio analysis failed");
            console.error("API Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFaceCapture = async () => {
        if (!videoRef.current || !userId) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context || !videoRef.current?.videoWidth) return;
            
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                
                const formData = new FormData();
                formData.append('file', blob, 'face_capture.jpg');
                
                const res = await fetch(`${config.apiBaseUrl}/emotion/face`, {
                    method: 'POST',
                    headers: { 'x-user-id': userId },
                    body: formData
                });
                
                if (!res.ok) throw new Error('Failed to analyze face');
                
                const data = await res.json();
                setResult(data);
                setIsLoading(false);
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Face analysis failed");
            setIsLoading(false);
        }
    };

    if (!userId) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing...</p>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Emotional Check-In</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Real-time Analysis
                        </span>
                        <span className="bg-white px-4 py-2 rounded-lg shadow-sm font-mono">ID: {userId.slice(0, 12)}...</span>
                    </div>
                </motion.div>

                {/* Mode Switcher */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-3 mb-8 flex-wrap"
                >
                    {[
                        { id: 'text', label: 'Journaling', icon: Send, color: 'blue' },
                        { id: 'face', label: 'Face Scan', icon: Smile, color: 'purple' },
                        { id: 'voice', label: 'Voice Note', icon: Mic, color: 'orange' }
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => {
                                setMode(m.id as any);
                                if (m.id === 'face') startStream();
                            }}
                            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${
                                mode === m.id 
                                    ? `bg-gradient-to-r from-${m.color}-500 to-${m.color}-600 text-white shadow-lg scale-105` 
                                    : 'bg-white text-gray-600 hover:shadow-md'
                            }`}
                        >
                            <m.icon size={20} /> {m.label}
                        </button>
                    ))}
                </motion.div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-700"
                    >
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Area */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 min-h-[500px] flex flex-col"
                    >
                        {mode === 'text' && (
                            <>
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">What's on your mind?</h2>
                                <p className="text-gray-500 text-sm mb-6">Share your thoughts and let our AI understand your emotional state in real-time.</p>
                                <textarea
                                    className="w-full flex-1 p-4 rounded-xl bg-gray-50 border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                                    placeholder="I'm feeling... Today was challenging because... I'm grateful for..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <button
                                    onClick={handleTextSubmit}
                                    disabled={isLoading || !text.trim()}
                                    className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={18} /> Analyze Emotions
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {mode === 'face' && (
                            <div className="flex flex-col h-full">
                                <h2 className="text-2xl font-bold mb-2 text-gray-800">Face Emotion Scan</h2>
                                <p className="text-gray-500 text-sm mb-4">Let our AI analyze your facial expressions for real-time emotion detection.</p>
                                <div className="relative flex-1 bg-black rounded-2xl overflow-hidden mb-4 border-4 border-gray-200">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    {!stream && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 bg-gradient-to-br from-black/50 to-black/50">
                                            <Smile size={40} className="mb-2" />
                                            <p>Enable camera to start</p>
                                        </div>
                                    )}
                                    {stream && (
                                        <div className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div> LIVE
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={stopStream}
                                        className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Stop Camera
                                    </button>
                                    <button 
                                        onClick={handleFaceCapture}
                                        disabled={isLoading || !stream}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? 'Analyzing...' : 'Capture & Analyze'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {mode === 'voice' && (
                            <div className="flex flex-col h-full items-center justify-center space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Voice Analysis</h2>
                                    <p className="text-gray-500 text-sm text-center">Record your voice and let our AI detect your emotional tone in real-time.</p>
                                </div>

                                <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 bg-gradient-to-br from-orange-100 to-red-100 ${isRecording ? 'ring-4 ring-red-300 animate-pulse' : ''}`}>
                                    <Mic className={`w-16 h-16 ${isRecording ? 'text-red-500 animate-bounce' : 'text-orange-500'}`} />
                                </div>

                                {!isRecording && !audioBlob && (
                                    <button 
                                        onClick={startRecording}
                                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all text-lg"
                                    >
                                        Start Recording
                                    </button>
                                )}

                                {isRecording && (
                                    <button 
                                        onClick={stopRecording}
                                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2 text-lg"
                                    >
                                        <StopCircle size={24} /> Stop Recording
                                    </button>
                                )}

                                {audioBlob && !isRecording && (
                                    <div className="flex flex-col items-center gap-4 w-full">
                                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-green-700 text-sm font-medium">
                                            ✓ Recording saved successfully
                                        </div>
                                        <button 
                                            onClick={handleAudioSubmit}
                                            disabled={isLoading}
                                            className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? 'Analyzing...' : <>
                                                <Zap size={18} /> Analyze Voice
                                            </>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Results Area */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 min-h-[500px]"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Emotional Insights</h2>

                        {result ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                {/* Main Emotion Display */}
                                <div className={`bg-gradient-to-br ${EMOTION_COLORS[result.emotion] || 'from-gray-400 to-gray-500'} rounded-2xl p-8 text-white text-center`}>
                                    <span className="text-7xl block mb-4">{EMOTION_EMOJIS[result.emotion] || '🤷'}</span>
                                    <h3 className="text-4xl font-bold capitalize mb-2">{result.emotion}</h3>
                                    <div className="flex items-center justify-center gap-2 text-white/90">
                                        <Zap size={16} />
                                        <span className="text-lg font-semibold">{Math.round((result.confidence || 0) * 100)}% Confidence</span>
                                    </div>
                                </div>

                                {/* Emotion Breakdown */}
                                {result.details && Object.keys(result.details).length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <BarChart3 size={18} className="text-blue-600" /> Emotion Breakdown
                                        </h4>
                                        {Object.entries(result.details).slice(0, 5).map(([emotion, score]) => (
                                            <div key={emotion} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700 capitalize font-medium">{emotion}</span>
                                                    <span className="text-gray-600 font-semibold">{Math.round(Number(score) * 100)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Number(score) * 100}%` }}
                                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                                        className={`h-full bg-gradient-to-r ${EMOTION_COLORS[emotion] || 'from-gray-400 to-gray-500'}`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Metrics */}
                                {(result.arousal !== undefined || result.valence !== undefined || result.processing_complete_ms) && (
                                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                                        {result.arousal !== undefined && (
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-purple-600">{Math.round(result.arousal * 100)}%</p>
                                                <p className="text-xs text-gray-600">Arousal</p>
                                            </div>
                                        )}
                                        {result.valence !== undefined && (
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-blue-600">{Math.round(result.valence * 100)}%</p>
                                                <p className="text-xs text-gray-600">Valence</p>
                                            </div>
                                        )}
                                        {result.processing_complete_ms && (
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">{result.processing_complete_ms}ms</p>
                                                <p className="text-xs text-gray-600">Analysis Time</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Suggestion */}
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold block mb-2">💡 Suggestion:</span>
                                        Based on your emotion, try grounding exercises or take a short break to reset your mind.
                                    </p>
                                </div>

                                <button
                                    onClick={() => { setResult(null); setText(""); }}
                                    className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Start Another Session
                                </button>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Activity className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">No analysis yet</p>
                                <p className="text-sm mt-1">Select a mode and share to see real-time insights</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

