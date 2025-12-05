'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Upload, Palette, Image as ImageIcon,
    Type, Check, Loader2, ArrowRight, Layout
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const STEPS = [
    { id: 'identity', title: 'Identity', icon: Type },
    { id: 'colors', title: 'Colors', icon: Palette },
    { id: 'style', title: 'Style', icon: Layout },
    { id: 'assets', title: 'Assets', icon: ImageIcon },
];

const STYLE_PRESETS = [
    { id: 'modern', name: 'Modern Minimal', description: 'Clean lines, ample whitespace, sans-serif fonts.' },
    { id: 'bold', name: 'Bold & Vibrant', description: 'High contrast, saturated colors, punchy typography.' },
    { id: 'elegant', name: 'Classic Elegance', description: 'Serif fonts, muted tones, sophisticated layout.' },
];

export default function NewBrandKitPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        logo: null as File | null,
        colors: ['#000000', '#ffffff', '#3b82f6'],
        stylePreset: '',
        stylePrompt: '',
        images: [] as File[],
    });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push('/editor/new'); // Redirect to editor
    };

    const updateColor = (index: number, value: string) => {
        const newColors = [...formData.colors];
        newColors[index] = value;
        setFormData({ ...formData, colors: newColors });
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

            {/* Progress Bar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10" />
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-900 dark:bg-zinc-100 -z-10 transition-all duration-300"
                            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        />
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 px-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isActive || isCompleted
                                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600'
                                            }`}
                                    >
                                        {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-xs font-medium ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Form Area */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">

                    {/* Step 1: Identity */}
                    {currentStep === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent outline-none transition-all placeholder:text-zinc-400"
                                    placeholder="e.g. Acme Corp"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Brand Logo
                                </label>
                                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-center group">
                                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Click to upload logo</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">SVG, PNG, JPG (max. 2MB)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Colors */}
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Brand Colors</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Choose your primary, secondary, and accent colors.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {formData.colors.map((color, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                                                {idx === 0 ? 'Primary' : idx === 1 ? 'Secondary' : 'Accent'}
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-lg shadow-sm border border-black/10 dark:border-white/10"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <input
                                                    type="text"
                                                    value={color}
                                                    onChange={(e) => updateColor(idx, e.target.value)}
                                                    className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 text-sm text-zinc-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Style */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-4">
                                    Select a Visual Style
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {STYLE_PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setFormData({ ...formData, stylePreset: preset.id })}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.stylePreset === preset.id
                                                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/50'
                                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                }`}
                                        >
                                            <div className="font-semibold text-zinc-900 dark:text-white">{preset.name}</div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{preset.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    AI Style Prompt (Optional)
                                </label>
                                <textarea
                                    value={formData.stylePrompt}
                                    onChange={(e) => setFormData({ ...formData, stylePrompt: e.target.value })}
                                    rows={4}
                                    className="w-full rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 resize-none"
                                    placeholder="Describe your brand's vibe in detail (e.g., 'Futuristic tech startup with neon accents and dark background...')"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Assets */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Upload Brand Assets
                                </label>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Upload images, patterns, or icons used in your branding.</p>

                                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-center group">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                                    </div>
                                    <h4 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">Drop files here</h4>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">or click to browse</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={handleBack}
                        className={`px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${currentStep === 0
                                ? 'invisible'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-100/10"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : currentStep === STEPS.length - 1 ? (
                            'Create BrandKit'
                        ) : (
                            <>
                                Next Step
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
