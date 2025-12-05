'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.push('/studio');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-4">
                <Link
                    href="/"
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                        <span className="text-white dark:text-black font-bold text-2xl">B</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {isLogin ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-medium text-black dark:text-white hover:underline transition-all"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-zinc-100 dark:border-zinc-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-black dark:focus:ring-white sm:text-sm sm:leading-6"
                                    placeholder="you@example.com"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-zinc-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-black dark:focus:ring-white sm:text-sm sm:leading-6"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-sm font-semibold text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    isLogin ? 'Sign in' : 'Create account'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex w-full items-center justify-center rounded-md bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                onClick={() => router.push('/studio')}
                            >
                                <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
                                    <path
                                        d="M12.0003 20.4147C16.6533 20.4147 20.5753 17.1557 20.5753 11.9617C20.5753 11.3097 20.4783 10.7067 20.2983 10.1347H12.0003V13.3187H16.9203C16.7213 14.5027 15.6023 16.2737 12.0003 16.2737C8.75128 16.2737 6.00028 13.9877 6.00028 10.5007C6.00028 7.01373 8.75128 4.72773 12.0003 4.72773C14.0043 4.72773 15.3523 5.61773 16.1263 6.36273L18.4903 4.07873C16.8923 2.58973 14.6403 1.49873 11.9993 1.49873C6.20828 1.49873 1.49928 6.20873 1.49928 11.9997C1.49928 17.7907 6.20828 22.4997 12.0003 22.4997V20.4147Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                className="flex w-full items-center justify-center rounded-md bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                onClick={() => router.push('/studio')}
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.68 9.68 0 012.5-.34c.85.04 1.7.15 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                                </svg>
                                GitHub
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
