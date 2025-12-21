"use client";

import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import SplineWrapper from '@/components/SplineWrapper';
import PageTransition from '@/components/PageTransition';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Zap, Heart, Brain, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import BackgroundGradient from '@/components/BackgroundGradient';

export default function Home() {
  useAnonymousUser(); // Ensure ID exists
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <PageTransition>
      <BackgroundGradient />
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Helper layout for Spline to not block text */}
        <div className="absolute inset-0 z-0 opacity-60">
          <SplineWrapper scene="https://prod.spline.design/kZDDjO5HvC9y3ISJ/scene.splinecode" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white pointer-events-none" />
        </div>

        {/* Hero Content */}
        <motion.div
          style={{ y: y1, opacity }}
          className="relative z-10 text-center max-w-5xl px-4 flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/40 border border-white/60 text-gray-600 font-medium text-sm mb-8 backdrop-blur-md shadow-sm hover:bg-white/60 transition-colors cursor-default">
              <Sparkles size={14} className="text-yellow-500" />
              Private. Anonymous. Intelligent.
            </span>

            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tight mb-8 leading-[1.1] drop-shadow-sm">
              Feel better, <br />
              <span className="text-gradient-magic">naturally.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Your AI-powered safe space. Analyze your mood through voice, text, or expression—completely privately.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/check-in" className="group relative px-9 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-2">Start Check-In <ArrowRight size={20} /></span>
            </Link>

            <Link href="/resources" className="px-9 py-4 bg-white/50 backdrop-blur-sm text-gray-700 rounded-full font-semibold text-lg border border-white/60 shadow-sm hover:shadow-lg hover:bg-white/80 transition-all duration-300">
              Explore Resources
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Glass Cards */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="100% Anonymous"
              description="No accounts. No tracking. We use local encryption so your data never leaves your control."
              delay={0.1}
              color="text-blue-600"
            />
            <FeatureCard
              icon={Brain}
              title="Multimodal AI"
              description="Advanced sentiment analysis across voice, text, and facial cues for holistic insights."
              delay={0.2}
              color="text-purple-600"
            />
            <FeatureCard
              icon={Heart}
              title="Gentle Guidance"
              description="Calming breathing exercises and tailored resources to help you find your center."
              delay={0.3}
              color="text-rose-600"
            />
          </div>
        </div>
      </section>

      {/* Privacy Promise - Minimalist */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/60 backdrop-blur-xl border border-white/80 p-12 rounded-[2.5rem] shadow-xl"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8 text-gray-800">
              <Lock size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Your secrets die with your session.</h2>
            <p className="text-xl text-gray-600 mb-0 max-w-2xl mx-auto leading-relaxed">
              We engineered SereneMind to be ephemeral. Analysis happens in real-time, results are shown, and then the raw data evaporates.
            </p>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}

function FeatureCard({ icon: Icon, title, description, delay, color }: { icon: any, title: string, description: string, delay: number, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-100px" }}
      className="group p-8 rounded-[2rem] bg-white/40 border border-white/60 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 backdrop-blur-lg"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-6 ${color} bg-white group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-lg">{description}</p>
    </motion.div>
  );
}
