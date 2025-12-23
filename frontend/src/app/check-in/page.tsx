"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Smile, StopCircle, ArrowRight, X, User, Sparkles, ChevronLeft } from 'lucide-react';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import { config } from '@/config';
import PageTransition from '@/components/PageTransition';
import SplineWrapper from '@/components/SplineWrapper';
import EmotionOrb from '@/components/EmotionOrb';
import BackgroundGradient from '@/components/BackgroundGradient';
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

    // Helper for Lambda
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleSubmit = async () => {
        setStep('processing');
        setError(null);

        const headers: Record<string, string> = {};
        const bodyBase = { user_id: userId };

        try {
            let res;
            if (mode === 'text') {
                res = await fetch(`${config.apiBaseUrl}/emotion/text`, {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        modality: 'text',
                        text: textInput,
                        ...bodyBase
                    })
                });
            } else if (mode === 'voice' && audioBlob) {
                const audioB64 = await blobToBase64(audioBlob);
                res = await fetch(`${config.apiBaseUrl}/emotion/audio`, {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        modality: 'audio',
                        audio: audioB64,
                        ...bodyBase
                    })
                });
            } else if (mode === 'face' && videoRef.current) {
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

                const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg'));
                if (blob) {
                    const imageB64 = await blobToBase64(blob);
                    res = await fetch(`${config.apiBaseUrl}/emotion/face`, {
                        method: 'POST',
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            modality: 'vision',
                            image: imageB64,
                            ...bodyBase
                        })
                    });
                }
            }

            if (res && res.ok) {
                const data = await res.json();
                setTimeout(() => {
                    setResult(data);
                    setStep('result');
                    updateStreak();
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
            <BackgroundGradient />
            <div className="min-h-screen flex flex-col pt-24 px-4 pb-10">
                <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center">

                    <AnimatePresence mode="wait">

                        {/* Step 1: Mode Selection */}
                        {step === 'mode' && (
                            <motion.div
                                key="mode"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center"
                            >
                                <span className="inline-block py-1.5 px-4 rounded-full bg-white/40 border border-white/60 text-gray-600 font-medium text-sm mb-6 backdrop-blur-md shadow-sm">
                                    How are you feeling today?
                                </span>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 tracking-tight">Choose your medium.</h1>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <ModeCard
                                        icon={Send}
                                        title="Journal"
                                        description="Write about your day"
                                        color="text-blue-600"
                                        bg="bg-blue-50"
                                        onClick={() => { setMode('text'); setStep('input'); }}
                                    />
                                    <ModeCard
                                        icon={Mic}
                                        title="Voice"
                                        description="Just talk it out"
                                        color="text-purple-600"
                                        bg="bg-purple-50"
                                        onClick={() => { setMode('voice'); setStep('input'); }}
                                    />
                                    <ModeCard
                                        icon={Smile}
                                        title="Face Scan"
                                        description="Visual mood check"
                                        color="text-rose-600"
                                        bg="bg-rose-50"
                                        onClick={() => { setMode('face'); setStep('input'); startStream(); }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Input */}
                        {step === 'input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-20" />

                                <button
                                    onClick={resetSession}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100/50 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                >
                                    <X size={24} />
                                </button>

                                <button
                                    onClick={resetSession}
                                    className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100/50 text-gray-400 hover:text-gray-600 transition-colors z-10 hidden md:block"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <div className="p-8 md:p-12 min-h-[450px] flex flex-col items-center justify-center">
                                    {mode === 'text' && (
                                        <div className="w-full max-w-xl">
                                            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">What's on your mind?</h2>
                                            <textarea
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                placeholder="I'm feeling a bit overwhelmed because..."
                                                className="w-full h-48 p-6 bg-white/50 rounded-2xl border border-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 resize-none text-xl text-gray-700 placeholder-gray-400 transition-all outline-none"
                                                autoFocus
                                            />
                                            <ActionButton onClick={handleSubmit} disabled={!textInput.trim()} text="Analyze Emotions" />
                                        </div>
                                    )}

                                    {mode === 'voice' && (
                                        <div className="text-center w-full max-w-lg">
                                            <h2 className="text-3xl font-bold mb-8 text-gray-800">Speak freely</h2>

                                            <div className="relative mb-10 h-40 flex items-center justify-center">
                                                {/* Pulse Rings */}
                                                {isRecording && (
                                                    <>
                                                        <div className="absolute w-32 h-32 rounded-full bg-red-400/20 animate-ping" />
                                                        <div className="absolute w-40 h-40 rounded-full bg-red-400/10 animate-ping" style={{ animationDelay: "0.2s" }} />
                                                    </>
                                                )}

                                                <button
                                                    onClick={handleVoiceStart}
                                                    disabled={isRecording}
                                                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                                                        ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-200'
                                                        : 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl hover:scale-105'
                                                        } text-white shadow-2xl`}
                                                >
                                                    <Mic size={36} />
                                                </button>
                                            </div>

                                            {isRecording ? (
                                                <div className="mb-8 min-h-[4rem]">
                                                    <p className="text-gray-500 mb-2 font-medium">Listening...</p>
                                                    <p className="text-xl text-gray-800 font-medium italic opacity-70">
                                                        "{transcript || "..."} "
                                                    </p>
                                                </div>
                                            ) : (
                                                !audioBlob && <p className="text-gray-500 mb-8">Tap the microphone to start</p>
                                            )}

                                            <div className="flex gap-4 justify-center">
                                                {isRecording && (
                                                    <button
                                                        onClick={handleVoiceStop}
                                                        className="px-8 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                                                    >
                                                        Stop Recording
                                                    </button>
                                                )}
                                                {audioBlob && !isRecording && (
                                                    <div className="flex flex-col gap-4 w-full">
                                                        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 rounded-lg mb-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                            Audio captured
                                                        </div>
                                                        <ActionButton onClick={handleSubmit} text="Analyze Voice" />
                                                        <button onClick={() => { resetRecording(); setTranscript(""); }} className="text-gray-400 hover:text-gray-600 text-sm">Cancel & Retry</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'face' && (
                                        <div className="w-full flex flex-col items-center">
                                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Center your face</h2>
                                            <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-3xl overflow-hidden mb-6 shadow-2xl border-4 border-white">
                                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                                <div className="absolute inset-0 pointer-events-none border-[2px] border-white/20 rounded-3xl" />
                                                {/* Face Guide Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                                    <div className="w-48 h-64 border-2 border-white/50 rounded-[50%]" />
                                                </div>
                                            </div>
                                            <div className="w-full max-w-md">
                                                <ActionButton onClick={handleSubmit} disabled={!stream} text="Capture & Analyze" />
                                            </div>
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
                                <div className="relative w-40 h-40 mb-8">
                                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping" />
                                    <div className="absolute inset-2 border-4 border-purple-500/30 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
                                    <div className="absolute inset-0 border-4 border-t-white border-r-transparent border-b-white/50 border-l-transparent rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles className="text-purple-400 animate-pulse" size={40} />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing...</h2>
                                <p className="text-gray-500">Connecting with your deeper self</p>
                            </motion.div>
                        )}

                        {/* Step 4: Result */}
                        {step === 'result' && result && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden"
                            >
                                <div className="p-10 md:p-14 flex flex-col items-center text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider mb-8">
                                        <Sparkles size={12} /> Analysis Complete
                                    </div>

                                    <div className="mb-8 scale-150">
                                        <EmotionOrb emotion={result.emotion || result.overall_emotion} confidence={result.confidence || 0.9} size="lg" />
                                    </div>

                                    <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 capitalize mb-4">
                                        {result.emotion || result.overall_emotion}
                                    </h1>

                                    <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
                                        We detected this emotion with <strong className="text-gray-900 font-bold">{Math.round((result.confidence || 0.85) * 100)}%</strong> confidence.
                                    </p>

                                    {/* Detailed Stats Cards */}
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Energy Lvl</span>
                                            <p className="text-2xl font-bold text-gray-800">{Math.round((result.arousal || 0.4) * 100)}%</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Positivity</span>
                                            <p className="text-2xl font-bold text-gray-800">{Math.round((result.valence || 0.5) * 100)}%</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                        <button
                                            onClick={resetSession}
                                            className="flex-1 px-6 py-4 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                                        >
                                            Check In Again
                                        </button>
                                        <a
                                            href="/dashboard"
                                            className="flex-1 px-8 py-4 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            View Trends <ArrowRight size={18} />
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

function ModeCard({ icon: Icon, title, description, bg, color, onClick }: any) {
    return (
        <motion.button
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group relative bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all text-left overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-bl-[4rem] opacity-50 transition-transform group-hover:scale-110`} />

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color} mb-6 relative z-10`}>
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1 relative z-10">{title}</h3>
            <p className="text-sm text-gray-500 relative z-10">{description}</p>
        </motion.button>
    );
}

function ActionButton({ onClick, disabled, text }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white h-16 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] hover:shadow-blue-300 disabled:opacity-50 disabled:shadow-none disabled:transform-none transition-all mt-6 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles size={20} /> {text}
            </span>
        </button>
    );
}
