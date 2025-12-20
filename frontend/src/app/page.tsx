"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Activity, ArrowRight, Smile } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-2">
                <Shield className="w-3 h-3" /> No Login Required
              </span>
              <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                100% Anonymous
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mt-6 leading-tight font-outfit">
              It’s okay not to be <span className="text-blue-500">okay all the time.</span>
            </h1>
            <p className="text-xl text-gray-500 mt-6 max-w-lg leading-relaxed">
              SereneMind is your private space to check in with your emotions.
              We utilize advanced, on-device AI to understand how you feel—without ever asking for your name or email.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/check-in" className="btn-primary flex items-center justify-center gap-2">
              Start Private Session <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/about" className="btn-secondary text-center">
              How it works
            </Link>
          </motion.div>

          <p className="text-xs text-gray-400 mt-4">* No data is shared with third parties. Your session is anonymous.</p>
        </div>

        {/* Visual / Illustration Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full relative"
        >
          <div className="aspect-square bg-gradient-to-tr from-blue-100 to-purple-100 rounded-[3rem] relative overflow-hidden shadow-2xl border border-white/40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white/50 backdrop-blur-xl rounded-full flex items-center justify-center animate-pulse">
                <Smile className="w-16 h-16 text-blue-400" />
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 right-10 bg-white p-4 rounded-2xl shadow-lg max-w-[150px]"
            >
              <div className="flex gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
              </div>
              <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-2 bg-gray-100 rounded w-2/3"></div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-white/50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Understanding You, Holistically</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Emotions are complex. We analyze patterns across multiple modalities to give you a clearer picture of your mental wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Activity className="w-8 h-8 text-blue-500" />,
                title: "Multimodal Detection",
                desc: "We analyze tone of voice, facial micro-expressions, and written words to detect underlying emotions."
              },
              {
                icon: <Shield className="w-8 h-8 text-green-500" />,
                title: "No Sign-Up Needed",
                desc: "We believe privacy is a right. Use SereneMind instantly without creating an account."
              },
              {
                icon: <Lock className="w-8 h-8 text-orange-500" />,
                title: "Ethical AI",
                desc: "Designed to support, not diagnose. Our models run securely and we don't sell your data."
              }
            ].map((f, i) => (
              <div key={i} className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
                <div className="bg-gray-50 p-3 rounded-2xl w-fit mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Footer */}
      <footer className="w-full bg-gray-100 py-8 px-6 text-center border-t border-gray-200">
        <p className="text-gray-500 text-sm max-w-2xl mx-auto mb-2">
          <strong>Disclaimer:</strong> Serene Mind is an emotional support AI tool and <strong>does not provide medical diagnoses</strong>.
          If you are in crisis, please contact your local emergency services or a mental health professional immediately.
        </p>
        <div className="text-xs text-gray-400">
          <a href="#" className="underline hover:text-gray-600">Privacy Policy</a> • <a href="#" className="underline hover:text-gray-600">Crisis Resources</a>
        </div>
      </footer>
    </div>
  );
}
