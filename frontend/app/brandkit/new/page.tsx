'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/auth-context';
import { createBrandKit } from '@/lib/brandkit-service';
import BrandKitForm, { BrandKitFormData } from '@/components/BrandKitForm';

export default function NewBrandKitPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBack = () => {
        router.push('/studio');
    };

    const handleSubmit = async (formData: BrandKitFormData) => {
        if (!user) {
            console.error("No user logged in");
            return;
        }
        setIsSubmitting(true);
        try {
            await createBrandKit(
                user.uid,
                {
                    name: formData.name,
                    colors: formData.colors,
                    stylePreset: formData.stylePreset,
                    stylePrompt: formData.stylePrompt,
                },
                formData.logo,
                formData.images
            );
            router.push('/studio');
        } catch (error) {
            console.error("Failed to create brand kit", error);
            // Optionally set global error state here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 flex flex-col">
            {/* Header */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-zinc-900 dark:text-white">Create BrandKit</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <BrandKitForm
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                />
            </main>
        </div>
    );
}
