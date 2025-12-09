'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, LayoutTemplate, X, Tag, ShoppingBag, Calendar, Sun, Palette, Zap } from 'lucide-react';
import { getTemplates, TemplateInfo } from '@/lib/api';

interface TemplatesOptionsPanelProps {
    isLoading: boolean;
    onSelectTemplate: (templateId: string) => void;
    onClose: () => void;
}

// Category icons and colors
const categoryConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
    sale: { icon: Tag, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    product: { icon: ShoppingBag, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    event: { icon: Calendar, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    seasonal: { icon: Sun, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    brand: { icon: Palette, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
};

export default function TemplatesOptionsPanel({
    isLoading,
    onSelectTemplate,
    onClose
}: TemplatesOptionsPanelProps) {
    const [templates, setTemplates] = useState<TemplateInfo[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Fetch templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoadingTemplates(true);
                const data = await getTemplates();
                setTemplates(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch templates:', err);
                setError('Failed to load templates');
                // Use fallback templates if API fails
                setTemplates([
                    { id: 'sale-banner-01', name: 'Big Sale Banner', description: 'Perfect for announcing sales and discounts', thumbnail: '', category: 'sale' },
                    { id: 'product-showcase-01', name: 'Product Spotlight', description: 'Highlight a single product', thumbnail: '', category: 'product' },
                    { id: 'event-promo-01', name: 'Event Announcement', description: 'Announce events or launches', thumbnail: '', category: 'event' },
                    { id: 'seasonal-offer-01', name: 'Seasonal Special', description: 'Promote seasonal offers', thumbnail: '', category: 'seasonal' },
                    { id: 'minimalist-brand-01', name: 'Minimalist Brand', description: 'Clean brand-focused design', thumbnail: '', category: 'brand' },
                    { id: 'flash-deal-01', name: 'Flash Deal', description: 'Urgent time-sensitive deals', thumbnail: '', category: 'sale' },
                ]);
            } finally {
                setLoadingTemplates(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleTemplateClick = (templateId: string) => {
        if (isLoading) return;
        setSelectedId(templateId);
        onSelectTemplate(templateId);
    };

    const getCategoryInfo = (category: string) => {
        return categoryConfig[category] || { icon: LayoutTemplate, color: 'text-zinc-500', bgColor: 'bg-zinc-500/10' };
    };

    return (
        <div className="absolute top-20 right-4 w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-500/20">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Templates</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                {/* Loading state */}
                {loadingTemplates ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                        <span className="ml-2 text-sm text-zinc-500">Loading templates...</span>
                    </div>
                ) : error && templates.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Info text */}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                            Choose a template to generate a poster with your brand's style, colors, and assets using AI.
                        </p>

                        {/* Templates Grid */}
                        <div className="grid grid-cols-1 gap-3">
                            {templates.map((template) => {
                                const { icon: CategoryIcon, color, bgColor } = getCategoryInfo(template.category);
                                const isSelected = selectedId === template.id && isLoading;

                                return (
                                    <button
                                        key={template.id}
                                        onClick={() => handleTemplateClick(template.id)}
                                        disabled={isLoading}
                                        className={`
                                            relative p-4 rounded-xl border-2 text-left transition-all duration-200
                                            ${isSelected
                                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                            }
                                            ${isLoading && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Category Icon */}
                                            <div className={`p-2 rounded-lg ${bgColor}`}>
                                                <CategoryIcon className={`w-5 h-5 ${color}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                                                        {template.name}
                                                    </h4>
                                                    {isSelected && (
                                                        <Loader2 className="w-4 h-4 animate-spin text-violet-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                                                    {template.description}
                                                </p>
                                                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${bgColor} ${color}`}>
                                                    {template.category}
                                                </span>
                                            </div>

                                            {/* Arrow indicator */}
                                            {!isLoading && (
                                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Zap className="w-4 h-4 text-violet-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Generating overlay */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-violet-500/5 rounded-xl flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-full shadow-lg border border-violet-200 dark:border-violet-800">
                                                        <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                                                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                                                            Generating...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer info */}
                        <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-violet-500" />
                                <span>
                                    Templates use <strong>Gemini AI</strong> to generate text content based on your brand.
                                    All three formats (Facebook, Instagram, Story) will be available.
                                </span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
