'use client';

import { useState, useEffect } from 'react';
import {
    Upload, Palette, Image as ImageIcon,
    Type, Check, Loader2, ArrowRight, Layout, Trash2, Plus, X
} from 'lucide-react';
import { BrandKitData } from '@/lib/brandkit-service';

export type BrandKitFormData = {
    name: string;
    logo: File | null;
    colors: string[];
    stylePreset: string;
    stylePrompt: string;
    images: File[];
    // For edit mode, we might want to track existing URLs to show previews or deletion
    existingLogoUrl?: string;
    existingAssetUrls?: string[];
};

interface BrandKitFormProps {
    initialData?: BrandKitFormData;
    isSubmitting: boolean;
    onSubmit: (data: BrandKitFormData) => Promise<void>;
    submitLabel?: string;
}

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

export default function BrandKitForm({ initialData, isSubmitting, onSubmit, submitLabel = 'Create BrandKit' }: BrandKitFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [formData, setFormData] = useState<BrandKitFormData>(initialData || {
        name: '',
        logo: null,
        colors: ['#000000', '#ffffff', '#3b82f6'],
        stylePreset: '',
        stylePrompt: '',
        images: [],
    });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onSubmit(formData);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                setUploadError("Logo must be under 1MB");
                return;
            }
            setUploadError(null);
            setFormData({ ...formData, logo: file });
        }
    };

    const handleAssetsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles: File[] = [];
        let errorMsg = null;

        files.forEach(file => {
            if (file.size > 1024 * 1024) {
                errorMsg = `Image ${file.name} exceeds 1MB limit.`;
            } else {
                validFiles.push(file);
            }
        });

        if (errorMsg) {
            setUploadError(errorMsg);
        } else {
            setUploadError(null);
        }

        setFormData({ ...formData, images: [...formData.images, ...validFiles] });
    };

    const removeAsset = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    // --- Color Picker Logic ---
    const updateColor = (index: number, value: string) => {
        const newColors = [...formData.colors];
        newColors[index] = value;
        setFormData({ ...formData, colors: newColors });
    };

    const addColor = () => {
        if (formData.colors.length < 5) {
            setFormData({ ...formData, colors: [...formData.colors, '#000000'] });
        }
    };

    const removeColor = (index: number) => {
        if (formData.colors.length > 1) {
            const newColors = formData.colors.filter((_, i) => i !== index);
            setFormData({ ...formData, colors: newColors });
        }
    };

    return (
        <div className="flex flex-col min-h-[600px]">
            {/* Progress Bar */}
            <div className="mb-8">
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
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-zinc-50 dark:bg-zinc-950 px-2 transition-colors duration-300">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isActive || isCompleted
                                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950'
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

            {/* Form Area */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 transition-colors duration-300">

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
                            <div
                                className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-center group relative overflow-hidden"
                                onClick={() => document.getElementById('logo-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    id="logo-upload"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/svg+xml"
                                    onChange={handleLogoUpload}
                                />
                                {formData.logo ? (
                                    <div className="flex flex-col items-center">
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Selected: {formData.logo.name}</p>
                                        <p className="text-xs text-zinc-400">Click to change</p>
                                    </div>
                                ) : formData.existingLogoUrl ? (
                                    <div className="flex flex-col items-center">
                                        <img src={formData.existingLogoUrl} alt="Existing Logo" className="h-16 w-16 object-contain mb-2" />
                                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Current Logo</p>
                                        <p className="text-xs text-zinc-400">Click to change</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Click to upload logo</p>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">SVG, PNG, JPG (max. 1MB)</p>
                                    </>
                                )}
                            </div>
                            {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                        </div>
                    </div>
                )}

                {/* Step 2: Colors */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Brand Colors</h3>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{formData.colors.length} / 5</span>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Choose your brand colors (max 5).</p>

                            <div className="space-y-4">
                                {formData.colors.map((color, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={(e) => updateColor(idx, e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div
                                                className="w-full h-full rounded-lg shadow-sm border border-black/10 dark:border-white/10"
                                                style={{ backgroundColor: color }}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 mb-1 block">
                                                {idx === 0 ? 'Primary' : idx === 1 ? 'Secondary' : idx === 2 ? 'Accent' : `Color ${idx + 1}`}
                                            </label>
                                            <input
                                                type="text"
                                                value={color}
                                                onChange={(e) => updateColor(idx, e.target.value)}
                                                className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 text-sm text-zinc-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
                                            />
                                        </div>

                                        <button
                                            onClick={() => removeColor(idx)}
                                            disabled={formData.colors.length <= 1}
                                            className="p-2 text-zinc-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                {formData.colors.length < 5 && (
                                    <button
                                        onClick={addColor}
                                        className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-4 py-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 w-full justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Color
                                    </button>
                                )}
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

                            <div
                                className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-center group"
                                onClick={() => document.getElementById('assets-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    id="assets-upload"
                                    className="hidden"
                                    multiple
                                    accept="image/png, image/jpeg, image/svg+xml"
                                    onChange={handleAssetsUpload}
                                />
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                                </div>
                                <h4 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">Drop files here</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">or click to browse (max 1MB per file)</p>
                            </div>

                            {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

                            {/* Show New Assets */}
                            {formData.images.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">New Assets:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {formData.images.map((file, idx) => (
                                            <div key={idx} className="relative group p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                                <div className="text-xs truncate text-zinc-600 dark:text-zinc-300">{file.name}</div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeAsset(idx); }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Show Existing Assets (if any) */}
                            {formData.existingAssetUrls && formData.existingAssetUrls.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Existing Assets:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {formData.existingAssetUrls.map((url, idx) => (
                                            <div key={idx} className="relative group p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg h-24 flex items-center justify-center">
                                                <img src={url} className="max-h-full max-w-full object-contain" />
                                                {/* Note: Deleting existing assets is complex because we just update via set. 
                                                     For now we won't implement deleting existing assets in update mode in this iteration unless requested, 
                                                     as it requires separate logic to track deletions. */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={handlePrev}
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
                            {currentStep === STEPS.length - 1 ? 'Saving...' : 'Processing...'}
                        </>
                    ) : currentStep === STEPS.length - 1 ? (
                        submitLabel
                    ) : (
                        <>
                            Next Step
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
