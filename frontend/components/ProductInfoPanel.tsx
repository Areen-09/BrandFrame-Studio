'use client';

import { useState, useRef } from 'react';
import {
    X, Upload, Package, FileText, Tag, Image as ImageIcon,
    Sparkles, ChevronDown
} from 'lucide-react';

// Poster types for the dropdown
const POSTER_TYPES = [
    { id: 'sale', name: 'Sale', description: 'Promotional sale posters' },
    { id: 'promotion', name: 'Promotion', description: 'Special promotions and offers' },
    { id: 'event', name: 'Event', description: 'Event announcements' },
    { id: 'new_arrival', name: 'New Arrival', description: 'New product launches' },
    { id: 'seasonal', name: 'Seasonal', description: 'Seasonal campaigns' },
    { id: 'clearance', name: 'Clearance', description: 'Clearance and discount' },
    { id: 'bundle', name: 'Bundle Deal', description: 'Product bundles' },
    { id: 'loyalty', name: 'Loyalty Reward', description: 'Loyalty program promotions' },
];

export interface ProductInfo {
    productName: string;
    productDescription: string;
    posterType: string;
    posterDescription: string;
    productImageUrl: string | null;
    price: string;
    discountPrice: string;
    tagline: string;
}

interface ProductInfoPanelProps {
    onClose: () => void;
    onGenerate: (productInfo: ProductInfo) => void;
    isGenerating?: boolean;
}

export default function ProductInfoPanel({
    onClose,
    onGenerate,
    isGenerating = false
}: ProductInfoPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPosterTypeDropdown, setShowPosterTypeDropdown] = useState(false);

    const [productInfo, setProductInfo] = useState<ProductInfo>({
        productName: '',
        productDescription: '',
        posterType: 'sale',
        posterDescription: '',
        productImageUrl: null,
        price: '',
        discountPrice: '',
        tagline: '',
    });

    const handleInputChange = (field: keyof ProductInfo, value: string) => {
        setProductInfo(prev => ({ ...prev, [field]: value }));
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
                setProductInfo(prev => ({ ...prev, productImageUrl: dataUrl }));
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setProductInfo(prev => ({ ...prev, productImageUrl: null }));
    };

    const handleGenerate = () => {
        if (!productInfo.productName.trim()) {
            alert('Please enter a product name');
            return;
        }
        onGenerate(productInfo);
    };

    const selectedPosterType = POSTER_TYPES.find(t => t.id === productInfo.posterType);

    return (
        <div className="absolute top-20 right-4 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200 max-h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Product Information</h3>
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
                {/* Product Name */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <Tag className="w-3 h-3" />
                        Product Name *
                    </label>
                    <input
                        type="text"
                        value={productInfo.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        placeholder="e.g., Organic Apple Juice"
                        className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                </div>

                {/* Product Description */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <FileText className="w-3 h-3" />
                        Product Description
                    </label>
                    <textarea
                        value={productInfo.productDescription}
                        onChange={(e) => handleInputChange('productDescription', e.target.value)}
                        placeholder="Describe your product features, benefits, etc."
                        rows={2}
                        className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    />
                </div>

                {/* Poster Type */}
                <div className="relative">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <Sparkles className="w-3 h-3" />
                        Poster Type
                    </label>
                    <button
                        onClick={() => setShowPosterTypeDropdown(!showPosterTypeDropdown)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span>{selectedPosterType?.name || 'Select type'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showPosterTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showPosterTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 max-h-48 overflow-auto z-50">
                            {POSTER_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        handleInputChange('posterType', type.id);
                                        setShowPosterTypeDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${productInfo.posterType === type.id ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                                        }`}
                                >
                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">{type.name}</div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{type.description}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Poster Description */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <FileText className="w-3 h-3" />
                        Poster Description
                    </label>
                    <textarea
                        value={productInfo.posterDescription}
                        onChange={(e) => handleInputChange('posterDescription', e.target.value)}
                        placeholder="Describe how the poster should look (colors, style, mood, layout preferences...)"
                        rows={3}
                        className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    />
                </div>


                {/* Tagline */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Tagline / CTA
                    </label>
                    <input
                        type="text"
                        value={productInfo.tagline}
                        onChange={(e) => handleInputChange('tagline', e.target.value)}
                        placeholder="e.g., Limited Time Offer!"
                        className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                </div>

                {/* Product Image Upload */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <ImageIcon className="w-3 h-3" />
                        Product Image
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {productInfo.productImageUrl ? (
                        <div className="relative group">
                            <img
                                src={productInfo.productImageUrl}
                                alt="Product"
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
                            <span className="text-xs font-medium">Upload Product Image</span>
                        </button>
                    )}
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Max size: 2MB</p>
                </div>
            </div>

            {/* Generate Button */}
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !productInfo.productName.trim()}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${isGenerating || !productInfo.productName.trim()
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
                            <Sparkles className="w-4 h-4" />
                            Generate Poster
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
