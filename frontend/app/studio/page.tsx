'use client';

import Link from 'next/link';
import { Plus, Settings, LogOut, Search, MoreVertical, Grid2X2Plus } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

// Mock data for existing brandkits
const MOCK_BRANDKITS = [
    {
        id: '1',
        name: 'Neon Pulse',
        colors: ['#00f2ff', '#ff00aa', '#000000', '#1a1a1a'],
        lastEdited: '2 hours ago',
    },
    {
        id: '2',
        name: 'Eco Green',
        colors: ['#2d6a4f', '#40916c', '#d8f3dc', '#ffffff'],
        lastEdited: '1 day ago',
    },
    {
        id: '3',
        name: 'Minimal Mono',
        colors: ['#000000', '#333333', '#666666', '#ffffff'],
        lastEdited: '3 days ago',
    },
];

export default function StudioPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            {/* Top Navigation */}
            <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Grid2X2Plus className="w-6 h-6 dark:text-white text-black" />
                            <span className="text-xl font-semibold text-zinc-900 dark:text-white">BrandFrame Studio</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search brandkits..."
                                    className="pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full text-sm focus:ring-2 focus:ring-black dark:focus:ring-white w-64 text-zinc-900 dark:text-zinc-100"
                                />
                            </div>
                            <ThemeToggle />
                            <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                                <Settings className="w-5 h-5" />
                            </button>
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My BrandKits</h1>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/brandkit/new"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New BrandKit
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Create New Card */}
                    <Link
                        href="/brandkit/new"
                        className="group relative flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                        </div>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white">Create New BrandKit</span>
                    </Link>

                    {/* Existing BrandKits */}
                    {MOCK_BRANDKITS.map((kit) => (
                        <div
                            key={kit.id}
                            className="group relative flex flex-col h-64 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all overflow-hidden"
                        >
                            {/* Preview Area (Color Splashes) */}
                            <div className="flex-1 p-6 relative bg-zinc-50 dark:bg-zinc-800/50">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md">
                                        <MoreVertical className="w-4 h-4 text-zinc-500" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 h-full content-center justify-center">
                                    {kit.colors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-12 h-12 rounded-full shadow-sm border border-black/5 dark:border-white/5"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <h3 className="font-semibold text-zinc-900 dark:text-white">{kit.name}</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Edited {kit.lastEdited}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
