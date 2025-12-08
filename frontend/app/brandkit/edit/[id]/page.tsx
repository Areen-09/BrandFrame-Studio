'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/auth-context';
import { getBrandKit, updateBrandKit, BrandKitData } from '@/lib/brandkit-service';
import BrandKitForm, { BrandKitFormData } from '@/components/BrandKitForm';

export default function EditBrandKitPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<BrandKitFormData | null>(null);

    useEffect(() => {
        const fetchBrandKit = async () => {
            if (user && params?.id) {
                try {
                    const data = await getBrandKit(user.uid, params.id as string);
                    if (data) {
                        setInitialData({
                            name: data.name,
                            logo: null,
                            colors: data.colors,
                            stylePreset: data.stylePreset,
                            stylePrompt: data.stylePrompt,
                            images: [],
                            existingLogoUrl: data.logoUrl,
                            existingAssetUrls: data.assetUrls
                        });
                    } else {
                        // Handle not found
                        console.error('BrandKit not found');
                        router.push('/studio');
                    }
                } catch (error) {
                    console.error('Error fetching brandkit:', error);
                } finally {
                    setIsLoading(false);
                }
            } else if (!user) {
                setIsLoading(false); // Should probably redirect to login
            }
        };

        fetchBrandKit();
    }, [user, params?.id, router]);

    const handleBack = () => {
        router.push('/studio');
    };

    const handleSubmit = async (formData: BrandKitFormData) => {
        if (!user || !params?.id) {
            console.error("No user logged in or missing ID");
            return;
        }
        setIsSubmitting(true);
        try {
            await updateBrandKit(
                user.uid,
                params.id as string,
                {
                    name: formData.name,
                    colors: formData.colors,
                    stylePreset: formData.stylePreset,
                    stylePrompt: formData.stylePrompt,
                    // Note: updateBrandKit handles logo/assets logic separately via the File objects
                    // We don't need to pass existing URLs back unless we modified the service to support re-ordering or deleting simple strings
                },
                formData.logo,
                formData.images
            );
            router.push('/studio'); // Or back to editor
        } catch (error) {
            console.error("Failed to update brand kit", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-zinc-100" />
            </div>
        );
    }

    if (!initialData) {
        return null; // Or some error state
    }

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
                        <span className="font-semibold text-zinc-900 dark:text-white">Edit BrandKit</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <BrandKitForm
                    initialData={initialData}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    submitLabel="Save Changes"
                />
            </main>
        </div>
    );
}
