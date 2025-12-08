'use client';

import { useEffect, useState } from 'react';
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    ChevronDown, Trash2
} from 'lucide-react';
import { TextProperties } from './FabricCanvas';

// Popular web-safe fonts
const FONTS = [
    'Inter',
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Verdana',
    'Courier New',
    'Trebuchet MS',
    'Impact',
    'Comic Sans MS',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128];

interface TextOptionsPanelProps {
    textProperties: TextProperties;
    onPropertyChange: (property: string, value: any) => void;
    onDelete: () => void;
}

export default function TextOptionsPanel({
    textProperties,
    onPropertyChange,
    onDelete
}: TextOptionsPanelProps) {
    const [localFontSize, setLocalFontSize] = useState(textProperties.fontSize.toString());
    const [showFontDropdown, setShowFontDropdown] = useState(false);
    const [showSizeDropdown, setShowSizeDropdown] = useState(false);

    useEffect(() => {
        setLocalFontSize(textProperties.fontSize.toString());
    }, [textProperties.fontSize]);

    const handleFontSizeChange = (value: string) => {
        setLocalFontSize(value);
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0 && numValue <= 999) {
            onPropertyChange('fontSize', numValue);
        }
    };

    const handleFontSizeBlur = () => {
        const numValue = parseInt(localFontSize, 10);
        if (isNaN(numValue) || numValue <= 0) {
            setLocalFontSize(textProperties.fontSize.toString());
        }
    };

    const toggleBold = () => {
        const newWeight = textProperties.fontWeight === 'bold' ? 'normal' : 'bold';
        onPropertyChange('fontWeight', newWeight);
    };

    const toggleItalic = () => {
        const newStyle = textProperties.fontStyle === 'italic' ? 'normal' : 'italic';
        onPropertyChange('fontStyle', newStyle);
    };

    const toggleUnderline = () => {
        onPropertyChange('underline', !textProperties.underline);
    };

    const setAlignment = (align: string) => {
        onPropertyChange('textAlign', align);
    };

    return (
        <div className="absolute top-20 right-4 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Text Options</h3>
                <button
                    onClick={onDelete}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete text"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* Font Family */}
                <div className="relative">
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Font Family</label>
                    <button
                        onClick={() => setShowFontDropdown(!showFontDropdown)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span style={{ fontFamily: textProperties.fontFamily }}>{textProperties.fontFamily}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showFontDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 max-h-48 overflow-auto z-50">
                            {FONTS.map(font => (
                                <button
                                    key={font}
                                    onClick={() => {
                                        onPropertyChange('fontFamily', font);
                                        setShowFontDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${textProperties.fontFamily === font ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                                        }`}
                                    style={{ fontFamily: font }}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Font Size */}
                <div className="relative">
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Font Size</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={localFontSize}
                            onChange={(e) => handleFontSizeChange(e.target.value)}
                            onBlur={handleFontSizeBlur}
                            className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            min={1}
                            max={999}
                        />
                        <button
                            onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                            className="px-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    {showSizeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 max-h-48 overflow-auto z-50">
                            {FONT_SIZES.map(size => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        handleFontSizeChange(size.toString());
                                        setShowSizeDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${textProperties.fontSize === size ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                                        }`}
                                >
                                    {size}px
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Color */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={textProperties.fill}
                            onChange={(e) => onPropertyChange('fill', e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-200 dark:border-zinc-700"
                        />
                        <input
                            type="text"
                            value={textProperties.fill}
                            onChange={(e) => onPropertyChange('fill', e.target.value)}
                            className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Style Toggles */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Style</label>
                    <div className="flex gap-1">
                        <button
                            onClick={toggleBold}
                            className={`flex-1 p-2.5 rounded-lg transition-all ${textProperties.fontWeight === 'bold'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="Bold"
                        >
                            <Bold className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                            onClick={toggleItalic}
                            className={`flex-1 p-2.5 rounded-lg transition-all ${textProperties.fontStyle === 'italic'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="Italic"
                        >
                            <Italic className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                            onClick={toggleUnderline}
                            className={`flex-1 p-2.5 rounded-lg transition-all ${textProperties.underline
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="Underline"
                        >
                            <Underline className="w-4 h-4 mx-auto" />
                        </button>
                    </div>
                </div>

                {/* Alignment */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Alignment</label>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setAlignment('left')}
                            className={`flex-1 p-2.5 rounded-lg transition-all ${textProperties.textAlign === 'left'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="Left"
                        >
                            <AlignLeft className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                            onClick={() => setAlignment('center')}
                            className={`flex-1 p-2.5 rounded-lg transition-all ${textProperties.textAlign === 'center'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="Center"
                        >
                            <AlignCenter className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                            onClick={() => setAlignment('right')}
                            className={`flex-1 p-2.5 rounded-lg transition-all ${textProperties.textAlign === 'right'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="Right"
                        >
                            <AlignRight className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                            onClick={() => setAlignment('justify')}
                            className={`flex-1 p-2.5 rounded-lg transition-all ${textProperties.textAlign === 'justify'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="Justify"
                        >
                            <AlignJustify className="w-4 h-4 mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
