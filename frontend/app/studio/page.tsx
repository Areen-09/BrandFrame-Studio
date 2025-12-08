'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Plus, Settings, LogOut, Search, MoreVertical, Grid2X2Plus, Loader2, Trash2, Pencil } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/auth-context';
import { getUserBrandKits, deleteBrandKit, BrandKitData } from '@/lib/brandkit-service';

export default function StudioPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [brandKits, setBrandKits] = useState<BrandKitData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBrandKits = async () => {
            if (user) {
                const kits = await getUserBrandKits(user.uid);
                setBrandKits(kits);
            }
            setIsLoading(false);
        };
        fetchBrandKits();
    }, [user]);

    // Close menu when clicking outside - but only if not clicking inside the menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };
        // Use capture phase to get the event before React's synthetic events
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

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
                            <div className="relative">
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>

                                {isSettingsOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
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
                        className="group relative flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
                    >
                        <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                        </div>
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">Create New BrandKit</span>
                    </Link>

                    {/* Existing BrandKits */}
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                        </div>
                    ) : brandKits.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-zinc-500 dark:text-zinc-400">
                            No brand kits found. Create one to get started!
                        </div>
                    ) : (
                        brandKits.map((kit) => (
                            <div
                                key={kit.id}
                                className="group relative flex flex-col h-64 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all"
                            >
                                {/* Main Clickable Area */}
                                <div
                                    onClick={() => router.push(`/editor/${kit.id}`)}
                                    className="flex flex-col h-full w-full rounded-xl overflow-hidden cursor-pointer"
                                >
                                    {/* Preview Area (Color Splashes) */}
                                    <div className="flex-1 p-6 relative bg-zinc-50 dark:bg-zinc-800/50">
                                        <div className="flex flex-wrap gap-2 h-full content-center justify-center">
                                            {/* Try to show logo if available, else colors */}
                                            {kit.logoUrl ? (
                                                <img src={kit.logoUrl} alt={kit.name} className="h-16 w-16 object-contain mb-2" />
                                            ) : null}
                                            <div className="flex gap-2 justify-center w-full">
                                                {kit.colors.map((color, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-8 h-8 rounded-full shadow-sm border border-black/5 dark:border-white/5"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">{kit.name}</h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            {kit.createdAt ? new Date(kit.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                        </p>
                                    </div>
                                </div>

                                {/* Menu Button (Absolute positioned on top) */}
                                <div
                                    ref={activeMenuId === kit.id ? menuRef : null}
                                    className={`absolute top-4 right-4 z-20 transition-opacity ${activeMenuId === kit.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                >
                                    <button
                                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md bg-white/50 dark:bg-black/50 backdrop-blur-sm shadow-sm border border-black/5 dark:border-white/10 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (kit.id) {
                                                setActiveMenuId(activeMenuId === kit.id ? null : kit.id);
                                            }
                                        }}
                                    >
                                        <MoreVertical className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                                    </button>

                                    {activeMenuId === kit.id && (
                                        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/brandkit/edit/${kit.id}`);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (user && kit.id && confirm('Are you sure you want to delete this BrandKit?')) {
                                                        try {
                                                            await deleteBrandKit(user.uid, kit.id);
                                                            setBrandKits(brandKits.filter(k => k.id !== kit.id));
                                                            setActiveMenuId(null);
                                                        } catch (error) {
                                                            console.error('Failed to delete brandkit', error);
                                                        }
                                                    }
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
