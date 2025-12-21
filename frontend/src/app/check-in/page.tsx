"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Smile, StopCircle, ArrowRight, X, User } from 'lucide-react';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import { config } from '@/config';
import PageTransition from '@/components/PageTransition';
import SplineWrapper from '@/components/SplineWrapper';
import EmotionOrb from '@/components/EmotionOrb';
import { updateStreak } from '@/components/StreakCounter';

export default function CheckIn() {
    const userId = useAnonymousUser();
    const [step, setStep] = useState<'mode' | 'input' | 'processing' | 'result'>('mode');
    const [mode, setMode] = useState<'text' | 'voice' | 'face' | null>(null);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Audio & Video
    const { videoRef, startStream, stopStream, stream } = useMediaStream();
    const { isRecording, audioBlob, startRecording, stopRecording, resetRecording } = useAudioRecorder();

    // Inputs
    const [textInput, setTextInput] = useState("");
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let finalTrans = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTrans += event.results[i][0].transcript;
                    }
                }
                if (finalTrans) setTranscript(prev => prev + " " + finalTrans);
            };
        }
    }, []);

    const resetSession = () => {
        setStep('mode');
        setMode(null);
        setResult(null);
        setTextInput("");
        setTranscript("");
        resetRecording(); // Reset audio
        stopStream();
    };

    // Handlers
    const handleVoiceStart = () => {
        setTranscript("");
        startRecording();
        if (recognitionRef.current) recognitionRef.current.start();
    };

    const handleVoiceStop = () => {
        stopRecording();
        if (recognitionRef.current) recognitionRef.current.stop();
    };

    const handleSubmit = async () => {
        setStep('processing');
        setError(null);

        const headers: Record<string, string> = {};
        if (userId) headers['x-user-id'] = userId;

        try {
            let res;
            if (mode === 'text') {
                res = await fetch(`${config.apiBaseUrl}/emotion/text`, {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textInput, user_id: userId })
                });
            } else if (mode === 'voice' && audioBlob) {
                const formData = new FormData();
                formData.append('file', audioBlob, 'audio.wav');
                // Send transcript too if backend supports it (implementation plan says yes, but keeping simple for now)

                res = await fetch(`${config.apiBaseUrl}/emotion/audio`, {
                    method: 'POST',
                    headers,
                    body: formData
                });
            } else if (mode === 'face' && videoRef.current) {
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

                const blob = await new Promise<Blob | null>(r => canvas.toBlob(r));
                if (blob) {
                    const formData = new FormData();
                    formData.append('file', blob, 'face.jpg');
                    res = await fetch(`${config.apiBaseUrl}/emotion/face`, {
                        method: 'POST',
                        headers,
                        body: formData
                    });
                }
            }

            if (res && res.ok) {
                const data = await res.json();

                // Simulate delay for "calm calculation" effect
                setTimeout(() => {
                    setResult(data);
                    setStep('result');
                    updateStreak(); // Gamification Hook
                }, 1500);
            } else {
                throw new Error("Analysis failed");
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
            setStep('input');
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
                <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col justify-center">

                    <AnimatePresence mode="wait">

                        {/* Step 1: Mode Selection */}
                        {step === 'mode' && (
                            <motion.div
                                key="mode"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center"
                            >
                                <h1 className="text-3xl font-bold text-gray-900 mb-8">How would you like to check in?</h1>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <ModeCard
                                        icon={Send}
                                        title="Journal"
                                        color="bg-blue-100 text-blue-600"
                                        onClick={() => { setMode('text'); setStep('input'); }}
                                    />
                                    <ModeCard
                                        icon={Mic}
                                        title="Voice"
                                        color="bg-orange-100 text-orange-600"
                                        onClick={() => { setMode('voice'); setStep('input'); }}
                                    />
                                    <ModeCard
                                        icon={Smile}
                                        title="Face Scan"
                                        color="bg-purple-100 text-purple-600"
                                        onClick={() => { setMode('face'); setStep('input'); startStream(); }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Input */}
                        {step === 'input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative"
                            >
                                <button onClick={resetSession} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>

                                <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
                                    {mode === 'text' && (
                                        <div className="w-full max-w-lg">
                                            <h2 className="text-2xl font-bold mb-4">Write it out</h2>
                                            <textarea
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                placeholder="I'm feeling..."
                                                className="w-full h-40 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 resize-none text-lg text-gray-700 placeholder-gray-400"
                                            />
                                            <ActionButton onClick={handleSubmit} disabled={!textInput.trim()} text="Analyze" />
                                        </div>
                                    )}

                                    {mode === 'voice' && (
                                        <div className="text-center">
                                            <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-6 transition-all ${isRecording ? 'bg-red-50 animate-pulse' : 'bg-orange-50'}`}>
                                                <Mic size={48} className={isRecording ? 'text-red-500' : 'text-orange-500'} />
                                            </div>
                                            {isRecording ? (
                                                <div className="mb-6">
                                                    <p className="text-gray-500 mb-2">Listening...</p>
                                                    <p className="text-gray-800 font-medium italic min-h-[1.5rem]">{transcript}</p>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 mb-6">Tap to start recording</p>
                                            )}

                                            {!isRecording && !audioBlob && (
                                                <button onClick={handleVoiceStart} className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold">Start Recording</button>
                                            )}
                                            {isRecording && (
                                                <button onClick={handleVoiceStop} className="bg-red-500 text-white px-8 py-3 rounded-full font-bold">Stop</button>
                                            )}
                                            {audioBlob && !isRecording && (
                                                <div className="space-y-4">
                                                    <p className="text-green-600 font-medium">Recording saved!</p>
                                                    <ActionButton onClick={handleSubmit} text="Analyze Voice" />
                                                    <button onClick={() => { resetRecording(); setTranscript(""); }} className="block mx-auto text-sm text-gray-400 underline">Record Again</button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {mode === 'face' && (
                                        <div className="w-full flex flex-col items-center">
                                            <div className="relative w-full max-w-md aspect-video bg-black rounded-2xl overflow-hidden mb-6 shadow-inner">
                                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                            </div>
                                            <ActionButton onClick={handleSubmit} disabled={!stream} text="Capture & Analyze" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Processing */}
                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-[400px]"
                            >
                                <div className="relative w-32 h-32 mb-6">
                                    <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-blue-200 border-l-transparent rounded-full animate-spin" />
                                </div>
                                <h2 className="text-xl font-medium text-gray-600 animate-pulse">Finding patterns...</h2>
                            </motion.div>
                        )}

                        {/* Step 4: Result */}
                        {step === 'result' && result && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                            >
                                <div className="p-10 flex flex-col items-center text-center">
                                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Analysis Complete</h2>

                                    <div className="mb-8">
                                        <EmotionOrb emotion={result.emotion || result.overall_emotion} confidence={result.confidence || 0.9} size="lg" />
                                    </div>

                                    <h1 className="text-4xl font-bold text-gray-900 capitalize mb-2">{result.emotion || result.overall_emotion}</h1>
                                    <p className="text-lg text-gray-500 mb-8 max-w-md">
                                        We detected this emotion with <strong className="text-gray-800">{Math.round((result.confidence || 0.85) * 100)}%</strong> confidence.
                                    </p>

                                    {/* Action items from Result */}
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                        <div className="bg-gray-50 p-4 rounded-xl text-left">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Valence</span>
                                            <p className="text-xl font-bold text-gray-800">{Math.round((result.valence || 0.5) * 100)}%</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl text-left">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Arousal</span>
                                            <p className="text-xl font-bold text-gray-800">{Math.round((result.arousal || 0.4) * 100)}%</p>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <button onClick={resetSession} className="px-6 py-3 rounded-full text-gray-600 font-medium hover:bg-gray-50">
                                            Check In Again
                                        </button>
                                        <a href="/dashboard" className="px-8 py-3 rounded-full bg-gray-900 text-white font-bold hover:shadow-lg transition-all">
                                            View Trends
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </PageTransition>
    );
}

function ModeCard({ icon: Icon, title, color, onClick }: any) {
    return (
        <motion.button
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-4 transition-all"
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={32} />
            </div>
            <span className="text-lg font-bold text-gray-800">{title}</span>
        </motion.button>
    );
}

function ActionButton({ onClick, disabled, text }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all mt-6"
        >
            {text}
        </button>
    );
}
