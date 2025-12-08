'use client';

import { useState } from 'react';
import {
    Square, Circle, Triangle, Star, Hexagon, Pentagon,
    Minus, ArrowRight, Spline, Trash2, ChevronDown
} from 'lucide-react';
import { ShapeProperties } from './FabricCanvas';

// Shape types for the shape picker
const SHAPES = [
    { id: 'rect', name: 'Rectangle', icon: Square },
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'triangle', name: 'Triangle', icon: Triangle },
    { id: 'star', name: 'Star', icon: Star },
    { id: 'pentagon', name: 'Pentagon', icon: Pentagon },
    { id: 'hexagon', name: 'Hexagon', icon: Hexagon },
];

const LINES = [
    { id: 'line', name: 'Line', icon: Minus },
    { id: 'arrow', name: 'Arrow', icon: ArrowRight },
    { id: 'curved', name: 'Curved Line', icon: Spline },
];

const STROKE_WIDTHS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];

interface ShapesOptionsPanelProps {
    mode: 'picker' | 'editor';
    shapeProperties?: ShapeProperties | null;
    onAddShape: (shapeType: string) => void;
    onPropertyChange?: (property: string, value: any) => void;
    onDelete?: () => void;
    onClose?: () => void;
}

export default function ShapesOptionsPanel({
    mode,
    shapeProperties,
    onAddShape,
    onPropertyChange,
    onDelete,
    onClose
}: ShapesOptionsPanelProps) {
    const [showStrokeWidthDropdown, setShowStrokeWidthDropdown] = useState(false);

    if (mode === 'picker') {
        return (
            <div className="absolute top-20 right-4 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Add Shape</h3>
                </div>

                <div className="p-4 space-y-4">
                    {/* Shapes Grid */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Basic Shapes</label>
                        <div className="grid grid-cols-3 gap-2">
                            {SHAPES.map(shape => {
                                const Icon = shape.icon;
                                return (
                                    <button
                                        key={shape.id}
                                        onClick={() => onAddShape(shape.id)}
                                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all group"
                                    >
                                        <Icon className="w-6 h-6 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">{shape.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Lines */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Lines</label>
                        <div className="grid grid-cols-3 gap-2">
                            {LINES.map(line => {
                                const Icon = line.icon;
                                return (
                                    <button
                                        key={line.id}
                                        onClick={() => onAddShape(line.id)}
                                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all group"
                                    >
                                        <Icon className="w-6 h-6 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">{line.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Editor mode - show properties for selected shape
    if (!shapeProperties || !onPropertyChange) return null;

    return (
        <div className="absolute top-20 right-4 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Shape Options</h3>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete shape"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Fill Color */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Fill Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={shapeProperties.fill === 'transparent' ? '#ffffff' : shapeProperties.fill}
                            onChange={(e) => onPropertyChange('fill', e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-200 dark:border-zinc-700"
                        />
                        <input
                            type="text"
                            value={shapeProperties.fill}
                            onChange={(e) => onPropertyChange('fill', e.target.value)}
                            className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <button
                            onClick={() => onPropertyChange('fill', 'transparent')}
                            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${shapeProperties.fill === 'transparent'
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="No fill"
                        >
                            None
                        </button>
                    </div>
                </div>

                {/* Stroke Color */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Stroke Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={shapeProperties.stroke === 'transparent' ? '#000000' : shapeProperties.stroke}
                            onChange={(e) => onPropertyChange('stroke', e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-200 dark:border-zinc-700"
                        />
                        <input
                            type="text"
                            value={shapeProperties.stroke}
                            onChange={(e) => onPropertyChange('stroke', e.target.value)}
                            className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <button
                            onClick={() => onPropertyChange('stroke', 'transparent')}
                            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${shapeProperties.stroke === 'transparent'
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            title="No stroke"
                        >
                            None
                        </button>
                    </div>
                </div>

                {/* Stroke Width */}
                <div className="relative">
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Stroke Width</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={shapeProperties.strokeWidth}
                            onChange={(e) => onPropertyChange('strokeWidth', parseInt(e.target.value, 10) || 0)}
                            className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            min={0}
                            max={50}
                        />
                        <button
                            onClick={() => setShowStrokeWidthDropdown(!showStrokeWidthDropdown)}
                            className="px-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showStrokeWidthDropdown ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    {showStrokeWidthDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 max-h-48 overflow-auto z-50">
                            {STROKE_WIDTHS.map(width => (
                                <button
                                    key={width}
                                    onClick={() => {
                                        onPropertyChange('strokeWidth', width);
                                        setShowStrokeWidthDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${shapeProperties.strokeWidth === width ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                                        }`}
                                >
                                    <div
                                        className="w-12 bg-zinc-400 dark:bg-zinc-500 rounded-full"
                                        style={{ height: Math.max(width, 1) }}
                                    />
                                    <span>{width}px</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Opacity */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Opacity: {Math.round(shapeProperties.opacity * 100)}%
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={shapeProperties.opacity}
                        onChange={(e) => onPropertyChange('opacity', parseFloat(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                    />
                </div>

                {/* Corner Radius (only for shapes that support it) */}
                {shapeProperties.rx !== undefined && (
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Corner Radius: {shapeProperties.rx}px
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={50}
                            step={1}
                            value={shapeProperties.rx}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                onPropertyChange('rx', val);
                                onPropertyChange('ry', val);
                            }}
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
