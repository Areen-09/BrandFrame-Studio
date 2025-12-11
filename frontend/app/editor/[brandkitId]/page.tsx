'use client';

import { useRef, useState, use, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Type, Image as ImageIcon, Shapes,
    Download, Monitor, Smartphone, Layout, Wand2, LayoutTemplate, Package
} from 'lucide-react';
import FabricCanvas, { FabricCanvasHandle, TextProperties, ShapeProperties, ImageProperties } from '@/components/FabricCanvas';
import TextOptionsPanel from '@/components/TextOptionsPanel';
import ShapesOptionsPanel from '@/components/ShapesOptionsPanel';
import AssetsOptionsPanel from '@/components/AssetsOptionsPanel';
import TemplatesOptionsPanel from '@/components/TemplatesOptionsPanel';
import ProductInfoPanel, { ProductInfo } from '@/components/ProductInfoPanel';
import GenerateAIPanel, { GenerateAIInput } from '@/components/GenerateAIPanel';
import ThemeToggle from '@/components/ThemeToggle';
import { generateCreative, CreativeRequest, getProxiedImageUrl, generateFromTemplate, CanvasFormat, generateProductPoster, ProductPosterRequest, removeBackground } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { getBrandKit, BrandKitData } from '@/lib/brandkit-service';
import { FabricObject } from 'fabric';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentFormat, setCurrentFormat] = useState(FORMATS[0]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Text state
    const [isTextSelected, setIsTextSelected] = useState(false);
    const [textProperties, setTextProperties] = useState<TextProperties | null>(null);

    // Shape state
    const [isShapeSelected, setIsShapeSelected] = useState(false);
    const [shapeProperties, setShapeProperties] = useState<ShapeProperties | null>(null);
    const [showShapesPicker, setShowShapesPicker] = useState(false);

    // Image/Assets state
    const [isImageSelected, setIsImageSelected] = useState(false);
    const [imageProperties, setImageProperties] = useState<ImageProperties | null>(null);
    const [showAssetsPicker, setShowAssetsPicker] = useState(false);
    const [brandKitData, setBrandKitData] = useState<BrandKitData | null>(null);

    // Templates state
    const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
    const [isTemplateGenerating, setIsTemplateGenerating] = useState(false);
    const [generatedFormats, setGeneratedFormats] = useState<{ facebook?: CanvasFormat; instagram?: CanvasFormat; story?: CanvasFormat } | null>(null);

    // Canvas states for each format (to preserve user edits when switching)
    const [canvasStates, setCanvasStates] = useState<{ [key: string]: any }>({});

    // Product Info state
    const [showProductInfoPanel, setShowProductInfoPanel] = useState(false);
    const [isProductGenerating, setIsProductGenerating] = useState(false);

    // Generate AI state
    const [showGenerateAIPanel, setShowGenerateAIPanel] = useState(false);

    // Remove background state
    const [isRemovingBackground, setIsRemovingBackground] = useState(false);

    // Scale factor for display (since 1080px is too big for screen)
    const displayScale = 0.4;

    // Fetch BrandKit data on mount
    useEffect(() => {
        const fetchBrandKit = async () => {
            if (user?.uid && brandkitId) {
                try {
                    const data = await getBrandKit(user.uid, brandkitId);
                    setBrandKitData(data);
                } catch (error) {
                    console.error('Failed to fetch brandkit:', error);
                }
            }
        };
        fetchBrandKit();
    }, [user?.uid, brandkitId]);

    const handleSelectionChange = useCallback((selectedObject: FabricObject | null, isText: boolean, isShape: boolean, isImage: boolean) => {
        setIsTextSelected(isText);
        setIsShapeSelected(isShape);
        setIsImageSelected(isImage);

        // Close pickers when something is selected
        if (selectedObject) {
            setShowShapesPicker(false);
            setShowAssetsPicker(false);
            setShowTemplatesPanel(false);
            setShowProductInfoPanel(false);
            setShowGenerateAIPanel(false);
        }

        if (isText && canvasRef.current) {
            const props = canvasRef.current.getSelectedTextProperties();
            setTextProperties(props);
            setShapeProperties(null);
            setImageProperties(null);
        } else if (isShape && canvasRef.current) {
            const props = canvasRef.current.getSelectedShapeProperties();
            setShapeProperties(props);
            setTextProperties(null);
            setImageProperties(null);
        } else if (isImage && canvasRef.current) {
            const props = canvasRef.current.getSelectedImageProperties();
            setImageProperties(props);
            setTextProperties(null);
            setShapeProperties(null);
        } else {
            setTextProperties(null);
            setShapeProperties(null);
            setImageProperties(null);
        }
    }, []);

    const handleTextPropertyChange = useCallback((property: string, value: any) => {
        if (canvasRef.current) {
            canvasRef.current.updateTextProperty(property, value);
            const props = canvasRef.current.getSelectedTextProperties();
            setTextProperties(props);
        }
    }, []);

    const handleShapePropertyChange = useCallback((property: string, value: any) => {
        if (canvasRef.current) {
            canvasRef.current.updateShapeProperty(property, value);
            const props = canvasRef.current.getSelectedShapeProperties();
            setShapeProperties(props);
        }
    }, []);

    const handleDeleteSelected = useCallback(() => {
        if (canvasRef.current) {
            canvasRef.current.deleteSelected();
            setIsTextSelected(false);
            setIsShapeSelected(false);
            setIsImageSelected(false);
            setTextProperties(null);
            setShapeProperties(null);
            setImageProperties(null);
        }
    }, []);

    // Image handlers
    const handleImagePropertyChange = useCallback((property: string, value: any) => {
        if (canvasRef.current) {
            canvasRef.current.updateImageProperty(property, value);
            const props = canvasRef.current.getSelectedImageProperties();
            setImageProperties(props);
        }
    }, []);

    const handleFlipImage = useCallback((direction: 'horizontal' | 'vertical') => {
        if (canvasRef.current) {
            canvasRef.current.flipImage(direction);
        }
    }, []);

    const handleFitToCanvas = useCallback(() => {
        if (canvasRef.current) {
            canvasRef.current.fitImageToCanvas();
            const props = canvasRef.current.getSelectedImageProperties();
            setImageProperties(props);
        }
    }, []);

    const handleResetImageSize = useCallback(() => {
        if (canvasRef.current) {
            canvasRef.current.resetImageSize();
            const props = canvasRef.current.getSelectedImageProperties();
            setImageProperties(props);
        }
    }, []);

    const handleRemoveBackground = useCallback(async () => {
        if (!canvasRef.current) return;

        const imageDataUrl = canvasRef.current.getSelectedImageDataUrl();
        if (!imageDataUrl) {
            alert('No image selected');
            return;
        }

        setIsRemovingBackground(true);
        try {
            const response = await removeBackground({ image_data: imageDataUrl });

            if (response.status === 'completed' && response.image_data) {
                await canvasRef.current.replaceSelectedImage(response.image_data);
                // Update image properties after replacement
                const props = canvasRef.current.getSelectedImageProperties();
                setImageProperties(props);
            } else {
                alert('Failed to remove background. Please try again.');
            }
        } catch (error) {
            console.error('Remove background failed:', error);
            alert('Error removing background. Make sure the backend is running with rembg installed.');
        } finally {
            setIsRemovingBackground(false);
        }
    }, []);

    const handleAddImageFromUrl = useCallback((url: string) => {
        // Use proxy for Firebase Storage URLs to bypass CORS
        const imageUrl = getProxiedImageUrl(url);
        canvasRef.current?.addImage(imageUrl);
        setShowAssetsPicker(false);
    }, []);

    const handleUploadImage = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                canvasRef.current?.addImage(dataUrl);
                setShowAssetsPicker(false);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleAssetsClick = useCallback(() => {
        setShowAssetsPicker(!showAssetsPicker);
        // Clear any selection when opening picker
        if (!showAssetsPicker) {
            canvasRef.current?.canvas?.discardActiveObject();
            canvasRef.current?.canvas?.requestRenderAll();
            setIsTextSelected(false);
            setIsShapeSelected(false);
            setIsImageSelected(false);
            setTextProperties(null);
            setShapeProperties(null);
            setImageProperties(null);
            setShowShapesPicker(false);
            setShowTemplatesPanel(false);
            setShowProductInfoPanel(false);
            setShowGenerateAIPanel(false);
        }
    }, [showAssetsPicker]);

    const handleAddShape = useCallback((shapeType: string) => {
        if (!canvasRef.current) return;

        switch (shapeType) {
            case 'rect':
                canvasRef.current.addRect();
                break;
            case 'circle':
                canvasRef.current.addCircle();
                break;
            case 'triangle':
                canvasRef.current.addTriangle();
                break;
            case 'star':
                canvasRef.current.addStar();
                break;
            case 'pentagon':
                canvasRef.current.addPolygon(5);
                break;
            case 'hexagon':
                canvasRef.current.addPolygon(6);
                break;
            case 'line':
                canvasRef.current.addLine();
                break;
            case 'arrow':
                canvasRef.current.addArrow();
                break;
            case 'curved':
                canvasRef.current.addCurvedLine();
                break;
        }

        setShowShapesPicker(false);
    }, []);

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

    const handleGenerateAIClick = () => {
        setShowGenerateAIPanel(!showGenerateAIPanel);
        // Clear any selection when opening panel
        if (!showGenerateAIPanel) {
            canvasRef.current?.canvas?.discardActiveObject();
            canvasRef.current?.canvas?.requestRenderAll();
            setIsTextSelected(false);
            setIsShapeSelected(false);
            setIsImageSelected(false);
            setTextProperties(null);
            setShapeProperties(null);
            setImageProperties(null);
            setShowShapesPicker(false);
            setShowAssetsPicker(false);
            setShowTemplatesPanel(false);
            setShowProductInfoPanel(false);
        }
    };

    const handleGenerateAISubmit = async (input: GenerateAIInput) => {
        if (!user?.uid) {
            alert('Please sign in to generate images');
            return;
        }

        setIsGenerating(true);
        try {
            // Build the prompt with optional reference image context
            let prompt = input.imageDescription;
            if (input.referenceImageUrl) {
                prompt += " (Reference image provided for style guidance)";
            }

            const request: CreativeRequest = {
                brandkit_id: brandkitId,
                user_id: user.uid,
                prompt: prompt,
                aspect_ratio: currentFormat.id === 'story' ? '9:16' : (currentFormat.id === 'facebook' ? '1.91:1' : '1:1')
            };

            const response = await generateCreative(request);

            if (response.image_url) {
                canvasRef.current?.addImage(response.image_url);
                setShowGenerateAIPanel(false);
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

    const handleShapesClick = () => {
        setShowShapesPicker(!showShapesPicker);
        // Clear any selection when opening picker
        if (!showShapesPicker) {
            canvasRef.current?.canvas?.discardActiveObject();
            canvasRef.current?.canvas?.requestRenderAll();
            setIsTextSelected(false);
            setIsShapeSelected(false);
            setTextProperties(null);
            setShapeProperties(null);
            setShowTemplatesPanel(false);
            setShowAssetsPicker(false);
            setShowProductInfoPanel(false);
            setShowGenerateAIPanel(false);
        }
    };

    const handleTemplatesClick = () => {
        setShowTemplatesPanel(!showTemplatesPanel);
        // Clear any selection when opening panel
        if (!showTemplatesPanel) {
            canvasRef.current?.canvas?.discardActiveObject();
            canvasRef.current?.canvas?.requestRenderAll();
            setIsTextSelected(false);
            setIsShapeSelected(false);
            setIsImageSelected(false);
            setTextProperties(null);
            setShapeProperties(null);
            setImageProperties(null);
            setShowShapesPicker(false);
            setShowAssetsPicker(false);
            setShowProductInfoPanel(false);
            setShowGenerateAIPanel(false);
        }
    };

    const handleProductInfoClick = () => {
        setShowProductInfoPanel(!showProductInfoPanel);
        // Clear any selection when opening panel
        if (!showProductInfoPanel) {
            canvasRef.current?.canvas?.discardActiveObject();
            canvasRef.current?.canvas?.requestRenderAll();
            setIsTextSelected(false);
            setIsShapeSelected(false);
            setIsImageSelected(false);
            setTextProperties(null);
            setShapeProperties(null);
            setImageProperties(null);
            setShowShapesPicker(false);
            setShowAssetsPicker(false);
            setShowTemplatesPanel(false);
            setShowGenerateAIPanel(false);
        }
    };

    const handleProductInfoGenerate = async (productInfo: ProductInfo) => {
        if (!user?.uid) {
            alert('Please sign in to generate posters');
            return;
        }

        setIsProductGenerating(true);
        try {
            const request: ProductPosterRequest = {
                user_id: user.uid,
                brandkit_id: brandkitId,
                product_name: productInfo.productName,
                product_description: productInfo.productDescription || undefined,
                poster_type: productInfo.posterType,
                poster_description: productInfo.posterDescription || undefined,
                product_image_data: productInfo.productImageUrl || undefined,
                tagline: productInfo.tagline || undefined,
            };

            const response = await generateProductPoster(request);

            if (response.status === 'completed' && response.formats) {
                // Store all formats for switching (clear previous user edits)
                setGeneratedFormats(response.formats);
                setCanvasStates({}); // Clear saved states when new generation happens

                // Determine which format to load based on current view
                let formatToLoad: CanvasFormat | undefined;
                if (currentFormat.id === 'facebook') {
                    formatToLoad = response.formats.facebook;
                } else if (currentFormat.id === 'story') {
                    formatToLoad = response.formats.story;
                } else {
                    formatToLoad = response.formats.instagram;
                }

                if (formatToLoad && formatToLoad.objects) {
                    // Load the generated poster to canvas
                    canvasRef.current?.loadFromJSON({
                        objects: formatToLoad.objects,
                        background: formatToLoad.background || '#ffffff'
                    });
                }

                setShowProductInfoPanel(false);
            } else {
                alert("Failed to generate poster. Please try again.");
            }
        } catch (error) {
            console.error("Generation failed", error);
            alert("Error generating poster.");
        } finally {
            setIsProductGenerating(false);
        }
    };

    const handleSelectTemplate = async (templateId: string) => {
        if (!user?.uid) {
            alert('Please sign in to use templates');
            return;
        }

        setIsTemplateGenerating(true);
        try {
            const response = await generateFromTemplate({
                user_id: user.uid,
                brandkit_id: brandkitId,
                template_id: templateId
            });

            if (response.status === 'completed' && response.formats) {
                // Store all formats (clear previous user edits)
                setGeneratedFormats(response.formats);
                setCanvasStates({}); // Clear saved states when new template is generated

                // Determine which format to load based on current view
                let formatToLoad: CanvasFormat | undefined;
                if (currentFormat.id === 'facebook') {
                    formatToLoad = response.formats.facebook;
                } else if (currentFormat.id === 'story') {
                    formatToLoad = response.formats.story;
                } else {
                    formatToLoad = response.formats.instagram;
                }

                if (formatToLoad && formatToLoad.objects) {
                    // Load the template to canvas
                    canvasRef.current?.loadFromJSON({
                        objects: formatToLoad.objects,
                        background: formatToLoad.background || '#ffffff'
                    });
                }

                setShowTemplatesPanel(false);
            } else {
                alert('Failed to generate template. Please try again.');
            }
        } catch (error) {
            console.error('Template generation failed:', error);
            alert('Error generating from template.');
        } finally {
            setIsTemplateGenerating(false);
        }
    };

    // Handle format change with generated templates
    const handleFormatChange = (format: typeof FORMATS[0]) => {
        // Save current canvas state before switching
        if (canvasRef.current) {
            const currentState = canvasRef.current.getCanvasState();
            if (currentState) {
                setCanvasStates(prev => ({
                    ...prev,
                    [currentFormat.id]: currentState
                }));
            }
        }

        setCurrentFormat(format);
        canvasRef.current?.resizeCanvas(format.width, format.height);

        // Check if we have a saved state for this format (user edits)
        if (canvasStates[format.id]) {
            canvasRef.current?.loadFromJSON(canvasStates[format.id]);
        }
        // Otherwise, if we have generated formats, load the appropriate one
        else if (generatedFormats) {
            let formatToLoad: CanvasFormat | undefined;
            if (format.id === 'facebook') {
                formatToLoad = generatedFormats.facebook;
            } else if (format.id === 'story') {
                formatToLoad = generatedFormats.story;
            } else {
                formatToLoad = generatedFormats.instagram;
            }

            if (formatToLoad && formatToLoad.objects) {
                canvasRef.current?.loadFromJSON({
                    objects: formatToLoad.objects,
                    background: formatToLoad.background || '#ffffff'
                });
            }
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
                    <ToolButton
                        icon={Package}
                        label={isProductGenerating ? "Generating..." : "Product Info"}
                        onClick={handleProductInfoClick}
                        active={showProductInfoPanel}
                        disabled={isProductGenerating}
                    />
                    <ToolButton
                        icon={Wand2}
                        label={isGenerating ? "Generating..." : "Generate AI"}
                        onClick={handleGenerateAIClick}
                        active={showGenerateAIPanel}
                        disabled={isGenerating}
                    />

                    <ToolButton
                        icon={LayoutTemplate}
                        label={isTemplateGenerating ? "Generating..." : "Templates"}
                        onClick={handleTemplatesClick}
                        active={showTemplatesPanel}
                        disabled={isTemplateGenerating}
                    />
                    <ToolButton icon={Type} label="Text" onClick={() => canvasRef.current?.addText('Double click to edit')} />
                    <ToolButton
                        icon={ImageIcon}
                        label="Assets"
                        onClick={handleAssetsClick}
                        active={showAssetsPicker}
                    />
                    <ToolButton
                        icon={Shapes}
                        label="Shapes"
                        onClick={handleShapesClick}
                        active={showShapesPicker}
                    />
                </aside>

                {/* Hidden file input for image upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Canvas Area */}
                <main className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-8 relative">
                    <div
                        className="shadow-2xl transition-all duration-300 origin-center"
                        style={{
                            transform: `scale(${displayScale})`,
                        }}
                    >
                        <FabricCanvas
                            ref={canvasRef}
                            width={currentFormat.width}
                            height={currentFormat.height}
                            onSelectionChange={handleSelectionChange}
                        />
                    </div>

                    {/* Text Options Panel */}
                    {isTextSelected && textProperties && (
                        <TextOptionsPanel
                            textProperties={textProperties}
                            onPropertyChange={handleTextPropertyChange}
                            onDelete={handleDeleteSelected}
                        />
                    )}

                    {/* Shape Picker Panel */}
                    {showShapesPicker && !isShapeSelected && (
                        <ShapesOptionsPanel
                            mode="picker"
                            onAddShape={handleAddShape}
                        />
                    )}

                    {/* Shape Editor Panel */}
                    {isShapeSelected && shapeProperties && (
                        <ShapesOptionsPanel
                            mode="editor"
                            shapeProperties={shapeProperties}
                            onAddShape={handleAddShape}
                            onPropertyChange={handleShapePropertyChange}
                            onDelete={handleDeleteSelected}
                        />
                    )}

                    {/* Assets Picker Panel */}
                    {showAssetsPicker && !isImageSelected && (
                        <AssetsOptionsPanel
                            mode="picker"
                            brandKitAssets={{
                                logoUrl: brandKitData?.logoUrl,
                                assetUrls: brandKitData?.assetUrls
                            }}
                            onAddImage={handleAddImageFromUrl}
                            onUploadImage={handleUploadImage}
                        />
                    )}

                    {/* Image Editor Panel */}
                    {isImageSelected && imageProperties && (
                        <AssetsOptionsPanel
                            mode="editor"
                            imageProperties={imageProperties}
                            onAddImage={handleAddImageFromUrl}
                            onPropertyChange={handleImagePropertyChange}
                            onFlip={handleFlipImage}
                            onFitToCanvas={handleFitToCanvas}
                            onResetSize={handleResetImageSize}
                            onDelete={handleDeleteSelected}
                            onRemoveBackground={handleRemoveBackground}
                            isRemovingBackground={isRemovingBackground}
                        />
                    )}

                    {/* Templates Panel */}
                    {showTemplatesPanel && (
                        <TemplatesOptionsPanel
                            isLoading={isTemplateGenerating}
                            onSelectTemplate={handleSelectTemplate}
                            onClose={() => setShowTemplatesPanel(false)}
                        />
                    )}

                    {/* Product Info Panel */}
                    {showProductInfoPanel && (
                        <ProductInfoPanel
                            onClose={() => setShowProductInfoPanel(false)}
                            onGenerate={handleProductInfoGenerate}
                            isGenerating={isProductGenerating}
                        />
                    )}

                    {/* Generate AI Panel */}
                    {showGenerateAIPanel && (
                        <GenerateAIPanel
                            onClose={() => setShowGenerateAIPanel(false)}
                            onGenerate={handleGenerateAISubmit}
                            isGenerating={isGenerating}
                        />
                    )}

                    {/* Zoom Info overlay */}
                    <div className="absolute bottom-6 right-6 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                        {(displayScale * 100).toFixed(0)}% • {currentFormat.width}x{currentFormat.height}px
                    </div>
                </main>
            </div>
        </div>
    );
}

function ToolButton({ icon: Icon, label, onClick, disabled, active }: { icon: any, label: string, onClick: () => void, disabled?: boolean, active?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 group w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active
                ? 'bg-zinc-900 dark:bg-zinc-100'
                : 'bg-zinc-100 dark:bg-zinc-800'
                } ${!disabled && !active && 'group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'}`}>
                <Icon className={`w-5 h-5 ${active
                    ? 'text-white dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400'
                    } ${!disabled && !active && 'group-hover:text-zinc-900 dark:group-hover:text-white'}`} />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 text-center leading-tight">{label}</span>
        </button>
    );
}


