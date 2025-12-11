'use client';

import { useState, useRef } from 'react';
import {
    Trash2, Upload, FlipHorizontal, FlipVertical,
    Maximize2, RotateCcw, ImageOff, Plus
} from 'lucide-react';

export interface ImageProperties {
    opacity: number;
    scaleX: number;
    scaleY: number;
}

interface BrandKitAssets {
    logoUrl?: string;
    assetUrls?: string[];
}

interface AssetsOptionsPanelProps {
    mode: 'picker' | 'editor';
    brandKitAssets?: BrandKitAssets;
    imageProperties?: ImageProperties | null;
    onAddImage: (url: string) => void;
    onUploadImage?: () => void;
    onPropertyChange?: (property: string, value: any) => void;
    onFlip?: (direction: 'horizontal' | 'vertical') => void;
    onFitToCanvas?: () => void;
    onResetSize?: () => void;
    onDelete?: () => void;
    onRemoveBackground?: () => void;
    isRemovingBackground?: boolean;
}

export default function AssetsOptionsPanel({
    mode,
    brandKitAssets,
    imageProperties,
    onAddImage,
    onUploadImage,
    onPropertyChange,
    onFlip,
    onFitToCanvas,
    onResetSize,
    onDelete,
    onRemoveBackground,
    isRemovingBackground = false
}: AssetsOptionsPanelProps) {

    if (mode === 'picker') {
        const allImages: string[] = [];
        if (brandKitAssets?.logoUrl) {
            allImages.push(brandKitAssets.logoUrl);
        }
        if (brandKitAssets?.assetUrls) {
            allImages.push(...brandKitAssets.assetUrls);
        }

        return (
            <div className="absolute top-20 right-4 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Assets</h3>
                    <button
                        onClick={onUploadImage}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                    </button>
                </div>

                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* BrandKit Assets Grid */}
                    {allImages.length > 0 ? (
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                BrandKit Images
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {allImages.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onAddImage(url)}
                                        className="aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:ring-2 hover:ring-blue-500 transition-all group relative"
                                    >
                                        <img
                                            src={url}
                                            alt={`Asset ${index + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Plus className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ImageOff className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No assets in this BrandKit
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                Upload images or add them to your BrandKit
                            </p>
                        </div>
                    )}

                    {/* Upload Section */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                            Add from Device
                        </label>
                        <button
                            onClick={onUploadImage}
                            className="w-full p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all flex flex-col items-center gap-2"
                        >
                            <Upload className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                Click to upload an image
                            </span>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                PNG, JPG up to 5MB
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Editor mode - show properties for selected image
    if (!imageProperties || !onPropertyChange) return null;

    return (
        <div className="absolute top-20 right-4 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Image Options</h3>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete image"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Opacity */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Opacity: {Math.round(imageProperties.opacity * 100)}%
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={imageProperties.opacity}
                        onChange={(e) => onPropertyChange('opacity', parseFloat(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                    />
                </div>

                {/* Transform Actions */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Transform</label>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onFlip?.('horizontal')}
                            className="flex-1 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all"
                            title="Flip Horizontal"
                        >
                            <FlipHorizontal className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                            onClick={() => onFlip?.('vertical')}
                            className="flex-1 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all"
                            title="Flip Vertical"
                        >
                            <FlipVertical className="w-4 h-4 mx-auto" />
                        </button>
                    </div>
                </div>

                {/* Size Actions */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Size</label>
                    <div className="flex gap-2">
                        <button
                            onClick={onFitToCanvas}
                            className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all text-xs font-medium"
                            title="Fit to Canvas"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                            Fit to Canvas
                        </button>
                        <button
                            onClick={onResetSize}
                            className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all text-xs font-medium"
                            title="Reset Size"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Remove Background */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Background</label>
                    <button
                        onClick={onRemoveBackground}
                        disabled={isRemovingBackground || !onRemoveBackground}
                        className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-white text-xs font-medium transition-all ${isRemovingBackground || !onRemoveBackground
                                ? 'bg-gradient-to-r from-purple-400 to-pink-400 opacity-60 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                            }`}
                        title="Remove image background using AI"
                    >
                        {isRemovingBackground ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Removing...
                            </>
                        ) : (
                            <>
                                <ImageOff className="w-3.5 h-3.5" />
                                Remove Background
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
