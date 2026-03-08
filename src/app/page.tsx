"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

const LOADING_TEXTS = [
  "Fetching what's trending...",
  "Running AI analysis...",
  "Synthesizing global data...",
  "Just a moment...",
];

type NewsData = {
  title: string;
  publish_date?: string;
  source_name?: string;
  content: string;
  key_points: string[];
  source_url: string;
  image_url?: string;
};

export default function Home() {
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<'local' | 'global'>('local');

  const fetchViralNews = async () => {
    setLoading(true);
    setError(null);
    // We intentionally don't clear the old news instantly, so it can crossfade out smoothly.

    try {
      const response = await fetch(`/api/get-viral-news?region=${region}`);
      const data = await response.json();

      if (!response.ok) {
        if (data && data.title && data.content) {
          setNews(data);
          return;
        }
        throw new Error(data.error || "Failed to fetch data from source.");
      }

      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-neutral-800 dark:text-neutral-200 flex flex-col items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden selection:bg-black/20 dark:selection:bg-white/20">

      {/* Top Navbar Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center max-w-5xl mx-auto w-full z-20"
      >
        <div className="flex items-center gap-2">
          {/* Minimalist Logo */}
          <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <span className="text-xl font-medium tracking-tighter text-black dark:text-white">whatidontknow</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md">
            <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
            <span className="text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-400 uppercase">System Online</span>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12 z-10 pt-16">

        {/* Header Section */}
        <div className="text-center flex flex-col items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-black/80 to-black/40 dark:from-white dark:to-white/60 leading-[1.1]"
          >
            Discover the narrative.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-light tracking-wide max-w-xl text-center"
          >
            One curated insight from today&apos;s trends, distilled by Gemini AI.<br />
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-mono font-medium tracking-widest text-neutral-600 dark:text-neutral-400 uppercase">
              <span className="flex items-center gap-2 bg-black/5 dark:bg-white/5 py-1.5 px-3 rounded-lg border border-black/10 dark:border-white/10 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span> LOCAL: Indonesia
              </span>
              <span className="hidden sm:block text-neutral-400 dark:text-neutral-600">/</span>
              <span className="flex items-center gap-2 bg-black/5 dark:bg-white/5 py-1.5 px-3 rounded-lg border border-black/10 dark:border-white/10 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400"></span> GLOBAL: Worldwide
              </span>
            </div>
          </motion.div>
        </div>

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          {/* Region Toggle (Animated) */}
          <div className="relative flex bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 p-1.5 rounded-full backdrop-blur-xl shadow-inner">
            {/* Sliding Background */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1.5 bottom-1.5 w-[100px] bg-white dark:bg-white/15 rounded-full shadow-lg border border-black/5 dark:border-white/5"
              initial={false}
              animate={{
                x: region === 'local' ? 0 : 100,
              }}
            />

            <button
              onClick={() => setRegion('local')}
              className={`relative z-10 w-[100px] py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors duration-300 ${region === 'local' ? 'text-black dark:text-white' : 'text-neutral-500 hover:text-black/80 dark:hover:text-white/80'}`}
            >
              Local
            </button>
            <button
              onClick={() => setRegion('global')}
              className={`relative z-10 w-[100px] py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors duration-300 ${region === 'global' ? 'text-black dark:text-white' : 'text-neutral-500 hover:text-black/80 dark:hover:text-white/80'}`}
            >
              Global
            </button>
          </div>

          <div className="relative group mt-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <button
              onClick={fetchViralNews}
              disabled={loading}
              className={`
              relative flex items-center gap-3 px-8 py-4 rounded-full border
              transition-all duration-300 font-medium text-sm tracking-widest uppercase overflow-hidden
              ${loading
                  ? "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-neutral-500 cursor-not-allowed"
                  : "border-black/20 dark:border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-800 dark:text-white hover:border-black/40 dark:hover:border-white/40 shadow-xl"
                }
            `}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-neutral-800/50 dark:text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </span>
              ) : "Extract Insight"}

              {/* Shimmer effect */}
              {!loading && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />}
            </button>
          </div>
        </motion.div>

        {/* Content Display Area */}
        <div className="w-full relative mt-4">
          <AnimatePresence mode="popLayout">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                transition={{ duration: 0.4 }}
                className="p-6 border border-red-500/20 bg-red-500/5 backdrop-blur-md rounded-2xl text-red-200/90 text-sm text-center max-w-md mx-auto"
              >
                <p className="font-medium tracking-wide uppercase text-xs mb-2 text-red-400">System Error</p>
                {error}
              </motion.div>
            ) : news ? (
              <motion.div
                key={news.title}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)", scale: 0.95 }}
                animate={{
                  opacity: loading ? 0.3 : 1,
                  y: 0,
                  filter: loading ? "blur(8px)" : "blur(0px)",
                  scale: loading ? 0.98 : 1
                }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)", scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/10 dark:shadow-black/50 group"
              >
                {/* Subtle top glare */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent opacity-50" />

                <h2 className="text-2xl sm:text-4xl font-serif font-semibold tracking-tight text-neutral-900 dark:text-white leading-tight mb-4">
                  {news.title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-8 border-b border-black/10 dark:border-white/10 pb-6">
                  {news.publish_date && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {news.publish_date}
                    </span>
                  )}
                  {news.publish_date && news.source_name && <span className="text-black/20 dark:text-white/20">•</span>}
                  {news.source_name && (
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      {news.source_name}
                    </span>
                  )}
                </div>

                {news.image_url && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full relative rounded-2xl overflow-hidden mb-8 border border-black/10 dark:border-white/10 aspect-video bg-black/5 dark:bg-white/5 flex items-center justify-center group/image"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-full h-full object-cover opacity-80 group-hover/image:opacity-100 group-hover/image:scale-105 transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl pointer-events-none" />
                  </motion.div>
                )}

                <div
                  className="text-base sm:text-xl font-serif text-neutral-700 dark:text-neutral-200 leading-relaxed font-normal mb-8 [&>p]:mb-6 last:[&>p]:mb-0 [&_strong]:text-black dark:[&_strong]:text-white [&_strong]:font-semibold [&_strong]:bg-black/5 dark:[&_strong]:bg-white/5 [&_strong]:px-1.5 [&_strong]:py-0.5 [&_strong]:rounded-md [&_strong]:border [&_strong]:border-black/10 dark:[&_strong]:border-white/10"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {news.key_points && news.key_points.length > 0 && (
                  <div className="mb-8 p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    <h3 className="text-xs font-semibold text-black/80 dark:text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                      Key Takeaways
                    </h3>
                    <ul className="space-y-4">
                      {news.key_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
                          <span className="text-emerald-600/50 dark:text-emerald-400/50 font-mono text-xs mt-1 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                          <span
                            className="leading-relaxed font-serif text-neutral-700 dark:text-neutral-300 [&_strong]:text-black dark:[&_strong]:text-white [&_strong]:font-semibold [&_strong]:bg-black/5 dark:[&_strong]:bg-white/5 [&_strong]:px-1.5 [&_strong]:py-0.5 [&_strong]:rounded-md [&_strong]:border [&_strong]:border-black/10 dark:[&_strong]:border-white/10"
                            dangerouslySetInnerHTML={{ __html: point }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6 mt-2">
                  <a
                    href={news.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest font-semibold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors flex items-center gap-2"
                  >
                    View Original Source
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-widest font-mono">Gemini Insight</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
