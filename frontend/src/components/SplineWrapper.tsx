"use client";

// import { Suspense } from 'react';
// import dynamic from 'next/dynamic';
// import ErrorBoundary from './ErrorBoundary';

// const Spline = dynamic(() => import('@splinetool/react-spline'), {
//     ssr: false,
//     loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50/50 animate-pulse"><div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div></div>
// });

interface SplineWrapperProps {
    scene: string;
    className?: string;
}

export default function SplineWrapper({ scene, className }: SplineWrapperProps) {
    // Spline is currently causing buffer read errors in this environment (React 19 + Next 16).
    // Failing gracefully to valid background gradients instead.
    return (
        <div className={`relative w-full h-full ${className} overflow-hidden pointer-events-none`}>
            {/* <ErrorBoundary fallback={<div className="w-full h-full bg-gradient-to-br from-blue-50/50 to-indigo-50/50" />}>
                <Suspense fallback={<div className="w-full h-full bg-gray-50/50 animate-pulse" />}>
                    <Spline scene={scene} />
                </Suspense>
            </ErrorBoundary> */}
            <div className="w-full h-full bg-transparent" />
        </div>
    );
}
