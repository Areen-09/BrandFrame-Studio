import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight, Sparkles, Palette, Layers, Grid2X2Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen font-sans bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Grid2X2Plus className="w-6 h-6 dark:text-white text-black" />
              <span className="text-xl font-semibold text-zinc-900 dark:text-white">BrandFrame Studio</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-lg shadow-zinc-900/20 dark:shadow-white/10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex flex-col">
        {/* Hero Section with Background */}
        <section className="relative h-screen w-full flex items-end pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Images */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('/bg-light-theme.jpg')] bg-cover bg-center bg-no-repeat dark:opacity-0 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-[url('/bg-dark-theme.jpg')] bg-cover bg-center bg-no-repeat opacity-0 dark:opacity-100 transition-opacity duration-300" />
            {/* Overlay for readability at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-black/90 dark:via-black/40 dark:to-transparent" />
          </div>

          {/* Hero Content - Aligned Bottom Left */}
          <div className="relative z-10 max-w-7xl w-full mx-auto">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/20 dark:border-white/10 text-zinc-800 dark:text-zinc-200 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Brand Design</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 drop-shadow-sm">
                Create stunning posters
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-900 dark:from-zinc-200 dark:to-white">
                  in seconds.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-zinc-800 dark:text-zinc-300 mb-8 max-w-lg font-medium">
                BrandFrame Studio combines intelligent design tools with your brand identity to generate professional marketing assets for every platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-white/90 transition-all hover:scale-105 shadow-xl shadow-zinc-900/20 dark:shadow-white/10"
                >
                  Start Designing <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-zinc-900 dark:text-white bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full hover:bg-white dark:hover:bg-black/70 transition-colors border border-zinc-200 dark:border-zinc-700">
                  View Examples
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid - Solid Background */}
        <section className="bg-zinc-50 dark:bg-zinc-950 py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Everything you need</h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Professional branding tools at your fingertips.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                  <Palette className="w-6 h-6 text-zinc-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Smart BrandKits</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Upload your assets once. We automatically apply your colors, fonts, and logos to every design consistent with your identity.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                  <Layers className="w-6 h-6 text-zinc-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Multi-Format Export</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Generate designs for Instagram Stories, Facebook Posts, and LinkedIn banners instantly with intelligent resizing.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-zinc-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">AI Generation</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Describe your promotion, and watch as our AI generates multiple professional design options for you to choose from.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
