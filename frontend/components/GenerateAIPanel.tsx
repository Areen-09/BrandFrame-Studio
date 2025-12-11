'use client';

import { useState, useRef } from 'react';
import {
    X, Upload, Wand2, FileText, Image as ImageIcon, Sparkles
} from 'lucide-react';

export interface GenerateAIInput {
    imageDescription: string;
    referenceImageUrl: string | null;
}

interface GenerateAIPanelProps {
    onClose: () => void;
    onGenerate: (input: GenerateAIInput) => void;
    isGenerating?: boolean;
}

export default function GenerateAIPanel({
    onClose,
    onGenerate,
    isGenerating = false
}: GenerateAIPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [input, setInput] = useState<GenerateAIInput>({
        imageDescription: '',
        referenceImageUrl: null,
    });

    const handleInputChange = (field: keyof GenerateAIInput, value: string) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setInput(prev => ({ ...prev, referenceImageUrl: dataUrl }));
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setInput(prev => ({ ...prev, referenceImageUrl: null }));
    };

    const handleGenerate = () => {
        if (!input.imageDescription.trim()) {
            alert('Please enter an image description');
            return;
        }
        onGenerate(input);
    };

    return (
        <div className="absolute top-20 right-4 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200 max-h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Generate AI Image</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Image Description */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <FileText className="w-3 h-3" />
                        Image Description *
                    </label>
                    <textarea
                        value={input.imageDescription}
                        onChange={(e) => handleInputChange('imageDescription', e.target.value)}
                        placeholder="Describe the image you want to generate (e.g., 'A vibrant summer sale banner with fresh fruits and gradient background')"
                        rows={4}
                        className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    />
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                        Be specific about colors, style, mood, and elements you want
                    </p>
                </div>

                {/* Reference Image Upload */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <ImageIcon className="w-3 h-3" />
                        Reference Image (Optional)
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {input.referenceImageUrl ? (
                        <div className="relative group">
                            <img
                                src={input.referenceImageUrl}
                                alt="Reference"
                                className="w-full h-32 object-contain bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                <button
                                    onClick={handleImageUpload}
                                    className="px-3 py-1.5 bg-white text-zinc-900 text-xs font-medium rounded-lg hover:bg-zinc-100 transition-colors"
                                >
                                    Replace
                                </button>
                                <button
                                    onClick={handleRemoveImage}
                                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleImageUpload}
                            className="w-full h-24 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 hover:border-purple-500 hover:text-purple-500 transition-colors"
                        >
                            <Upload className="w-6 h-6" />
                            <span className="text-xs font-medium">Upload Reference Image</span>
                        </button>
                    )}
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Upload an image to guide the AI generation style</p>
                </div>

                {/* Tips Section */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Tips for better results
                    </h4>
                    <ul className="text-[10px] text-purple-600 dark:text-purple-400 space-y-1 list-disc list-inside">
                        <li>Be specific about colors and style</li>
                        <li>Mention the purpose (sale, promo, etc.)</li>
                        <li>Include mood keywords (vibrant, minimal, etc.)</li>
                        <li>Reference image helps match a specific style</li>
                    </ul>
                </div>
            </div>

            {/* Generate Button */}
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !input.imageDescription.trim()}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${isGenerating || !input.imageDescription.trim()
                        ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-4 h-4" />
                            Generate Image
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
