"use client";

import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import SplineWrapper from '@/components/SplineWrapper';
import PageTransition from '@/components/PageTransition';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Zap, Heart, Brain, Lock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  useAnonymousUser(); // Ensure ID exists
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          {/* Placeholder for Spline - using a CSS fallback if loading fails or for demo */}
          <SplineWrapper scene="https://prod.spline.design/6Wq1Q7YGyM-iab9S/scene.splinecode" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white pointer-events-none" />
        </div>

        {/* Hero Content */}
        <motion.div
          style={{ y: y1, opacity }}
          className="relative z-10 text-center max-w-4xl px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 font-medium text-sm mb-6 backdrop-blur-md">
              Private. Anonymous. Intelligent.
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
              Understand your emotions <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">without say a word.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              A privacy-first mental health companion that listens to your voice, reads your expressions, and helps you find balance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/check-in" className="group relative px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <span className="relative z-10 flex items-center gap-2">Start Check-In <ArrowRight size={20} /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link href="/resources" className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
              Explore Resources
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Staggered Scroll */}
      <section className="py-32 px-4 relative bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="100% Anonymous"
              description="No login required. We don't ask for your name, email, or phone number. Your data stays yours."
              delay={0.1}
            />
            <FeatureCard
              icon={Brain}
              title="Multimodal AI"
              description="Our AI analyzes text, voice tone, and facial micro-expressions to provide a complete emotional picture."
              delay={0.2}
            />
            <FeatureCard
              icon={Heart}
              title="Gentle Support"
              description="No alarms or notifications. Just calm, actionable insights to help you breathe and reset."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Privacy Promise */}
      <section className="py-24 bg-gradient-calm relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Lock size={48} className="mx-auto text-gray-700 mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Your secrets are safe here.</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              We use client-side encryption and anonymous UUIDs. Deleting your browser history wipes your account existence forever.
            </p>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-100px" }}
      className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-blue-600">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
