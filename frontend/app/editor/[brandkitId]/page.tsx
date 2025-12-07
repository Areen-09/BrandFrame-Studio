'use client';

import { useRef, useState, use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Type, Image as ImageIcon, Square, Circle as CircleIcon,
    Download, Moon, Sun, Monitor, Smartphone, Layout, Wand2, Loader2
} from 'lucide-react';
import FabricCanvas, { FabricCanvasHandle } from '@/components/FabricCanvas';
import ThemeToggle from '@/components/ThemeToggle';
import { generateCreative, CreativeRequest } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

// Aspect Ratios
const FORMATS = [
    { id: 'instagram', name: 'Instagram Post', width: 1080, height: 1080, icon: Layout },
    { id: 'story', name: 'Instagram Story', width: 1080, height: 1920, icon: Smartphone },
    { id: 'facebook', name: 'Facebook Post', width: 1200, height: 630, icon: Monitor },
];

export default function EditorPage({ params }: { params: Promise<{ brandkitId: string }> }) {
    // Unwrap params using React.use()
    const { brandkitId } = use(params);
    const { user } = useAuth();

    const canvasRef = useRef<FabricCanvasHandle>(null);
    const [currentFormat, setCurrentFormat] = useState(FORMATS[0]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Scale factor for display (since 1080px is too big for screen)
    const displayScale = 0.4;

    const handleFormatChange = (format: typeof FORMATS[0]) => {
        setCurrentFormat(format);
        canvasRef.current?.resizeCanvas(format.width, format.height);
    };

    const handleDownload = () => {
        const dataUrl = canvasRef.current?.exportAsImage('png');
        if (dataUrl) {
            const link = document.createElement('a');
            link.download = `design-${brandkitId}-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleGenerateAI = async () => {
        const prompt = window.prompt("Enter a description for your poster (e.g., 'Summer sale for organic juice'):");
        if (!prompt) return;

        setIsGenerating(true);
        try {
            const request: CreativeRequest = {
                brandkit_id: brandkitId,
                user_id: user?.uid || '',
                prompt: prompt,
                aspect_ratio: currentFormat.id === 'story' ? '9:16' : (currentFormat.id === 'facebook' ? '1.91:1' : '1:1')
            };

            const response = await generateCreative(request);

            if (response.image_url) {
                // Add the generated image to the canvas
                // We use a proxy or cross-origin safe method if needed, but for now direct URL
                canvasRef.current?.addImage(response.image_url);
            } else {
                alert("Failed to generate image. Please try again.");
            }
        } catch (error) {
            console.error("Generation failed", error);
            alert("Error generating creative.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 overflow-hidden transition-colors duration-300">
            {/* Toolbar */}
            <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <Link
                        href="/studio"
                        className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-white text-sm">Untitled Design</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">BrandKit ID: {brandkitId}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                    {FORMATS.map(f => {
                        const Icon = f.icon;
                        return (
                            <button
                                key={f.id}
                                onClick={() => handleFormatChange(f)}
                                className={`p-2 rounded-md transition-all ${currentFormat.id === f.id
                                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                                    }`}
                                title={f.name}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-20 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-6 gap-6 z-10">
                    <ToolButton icon={Wand2} label={isGenerating ? "Generating..." : "Generate AI"} onClick={handleGenerateAI} disabled={isGenerating} />

                    <ToolButton icon={Layout} label="Templates" onClick={() => {
                        // Mock loading a template
                        const template = {
                            objects: [
                                { type: 'rect', left: 50, top: 50, width: 200, height: 200, fill: '#ff4444' },
                                { type: 'text', left: 70, top: 120, text: 'Sale!', fontSize: 40, fill: 'white' }
                            ],
                            background: '#ffffff'
                        };
                        canvasRef.current?.loadFromJSON(template);
                    }} />
                    <ToolButton icon={Type} label="Text" onClick={() => canvasRef.current?.addText('Double click to edit')} />
                    <ToolButton icon={ImageIcon} label="Image" onClick={() => canvasRef.current?.addImage('https://source.unsplash.com/random/400x400')} />
                    <ToolButton icon={Square} label="Rect" onClick={() => canvasRef.current?.addRect()} />
                    <ToolButton icon={CircleIcon} label="Circle" onClick={() => canvasRef.current?.addCircle()} />
                </aside>

                {/* Canvas Area */}
                <main className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-8 relative">
                    <div
                        className="shadow-2xl transition-all duration-300 origin-center"
                        style={{
                            transform: `scale(${displayScale})`, // Scale for display only
                            // Use a wrapper to handle 'centering' visually 
                        }}
                    >
                        <FabricCanvas
                            ref={canvasRef}
                            width={currentFormat.width}
                            height={currentFormat.height}
                        />
                    </div>

                    {/* Zoom Info overlay */}
                    <div className="absolute bottom-6 right-6 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                        {(displayScale * 100).toFixed(0)}% • {currentFormat.width}x{currentFormat.height}px
                    </div>
                </main>
            </div>
        </div>
    );
}

function ToolButton({ icon: Icon, label, onClick, disabled }: { icon: any, label: string, onClick: () => void, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 group w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className={`w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ${!disabled && 'group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'} transition-colors`}>
                <Icon className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 ${!disabled && 'group-hover:text-zinc-900 dark:group-hover:text-white'}`} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 text-center leading-tight">{label}</span>
        </button>
    );
}
