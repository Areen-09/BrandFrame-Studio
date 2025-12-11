'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Canvas, Rect, Textbox, Circle, FabricImage, FabricObject, Triangle, Polygon, Line, Path } from 'fabric';
import { getProxiedImageUrl } from '@/lib/api';

export interface TextProperties {
    fontFamily: string;
    fontSize: number;
    fill: string;
    fontWeight: string;
    fontStyle: string;
    underline: boolean;
    textAlign: string;
    lineHeight: number;
    charSpacing: number;
}

export interface ShapeProperties {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    rx?: number; // border radius for rectangles
    ry?: number;
}

export interface ImageProperties {
    opacity: number;
    scaleX: number;
    scaleY: number;
}

export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star' | 'pentagon' | 'hexagon' | 'line' | 'arrow' | 'curved-line';

export interface FabricCanvasHandle {
    addText: (text: string, options?: any) => void;
    addImage: (url: string) => void;
    addRect: (options?: any) => void;
    addCircle: (options?: any) => void;
    addTriangle: (options?: any) => void;
    addStar: (options?: any) => void;
    addPolygon: (sides: number, options?: any) => void;
    addLine: (options?: any) => void;
    addArrow: (options?: any) => void;
    addCurvedLine: (options?: any) => void;
    exportAsImage: (format?: 'png' | 'jpeg') => string;
    resizeCanvas: (width: number, height: number) => void;
    setCanvasBackground: (color: string) => void;
    loadFromJSON: (json: any) => void;
    clearCanvas: () => void;
    canvas: Canvas | null;
    // Text formatting methods
    updateTextProperty: (property: string, value: any) => void;
    getSelectedTextProperties: () => TextProperties | null;
    // Shape formatting methods
    updateShapeProperty: (property: string, value: any) => void;
    getSelectedShapeProperties: () => ShapeProperties | null;
    // Image formatting methods
    updateImageProperty: (property: string, value: any) => void;
    getSelectedImageProperties: () => ImageProperties | null;
    getSelectedImageDataUrl: () => string | null;
    replaceSelectedImage: (dataUrl: string) => Promise<void>;
    flipImage: (direction: 'horizontal' | 'vertical') => void;
    fitImageToCanvas: () => void;
    resetImageSize: () => void;
    deleteSelected: () => void;
    // Canvas state methods for format switching
    getCanvasState: () => any;
}

interface FabricCanvasProps {
    width: number;
    height: number;
    backgroundColor?: string;
    onSelectionChange?: (selectedObject: FabricObject | null, isText: boolean, isShape: boolean, isImage: boolean) => void;
}

// Helper to check if object is an image
const isImageObject = (obj: FabricObject | null): boolean => {
    if (!obj) return false;
    return obj instanceof FabricImage;
};

// Helper to check if object is a shape (not text or image)
const isShapeObject = (obj: FabricObject | null): boolean => {
    if (!obj) return false;
    return obj instanceof Rect || obj instanceof Circle || obj instanceof Triangle ||
        obj instanceof Polygon || obj instanceof Line || obj instanceof Path;
};

// Helper to create star polygon points
const createStarPoints = (outerRadius: number, innerRadius: number, points: number = 5): { x: number; y: number }[] => {
    const result = [];
    const step = Math.PI / points;
    for (let i = 0; i < 2 * points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * step - Math.PI / 2;
        result.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        });
    }
    return result;
};

// Helper to create regular polygon points
const createPolygonPoints = (radius: number, sides: number): { x: number; y: number }[] => {
    const result = [];
    const angle = (2 * Math.PI) / sides;
    for (let i = 0; i < sides; i++) {
        result.push({
            x: radius * Math.cos(i * angle - Math.PI / 2),
            y: radius * Math.sin(i * angle - Math.PI / 2)
        });
    }
    return result;
};

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
    ({ width, height, backgroundColor = '#ffffff', onSelectionChange }, ref) => {
        const canvasEl = useRef<HTMLCanvasElement>(null);
        const fabricCanvas = useRef<Canvas | null>(null);

        const handleSelectionChange = useCallback(() => {
            if (!fabricCanvas.current || !onSelectionChange) return;
            const activeObject = fabricCanvas.current.getActiveObject();
            const isText = activeObject instanceof Textbox;
            const isShape = isShapeObject(activeObject ?? null);
            const isImage = isImageObject(activeObject ?? null);
            onSelectionChange(activeObject ?? null, isText, isShape, isImage);
        }, [onSelectionChange]);

        useEffect(() => {
            if (!canvasEl.current) return;

            // Initialize Fabric Canvas
            const canvas = new Canvas(canvasEl.current, {
                width,
                height,
                backgroundColor,
                selection: true,
                preserveObjectStacking: true,
            });

            fabricCanvas.current = canvas;

            // Bring clicked object to front
            const handleMouseDown = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.bringObjectToFront(activeObject);
                    canvas.requestRenderAll();
                }
            };

            // Add selection event listeners
            canvas.on('selection:created', handleSelectionChange);
            canvas.on('selection:updated', handleSelectionChange);
            canvas.on('selection:cleared', () => {
                if (onSelectionChange) {
                    onSelectionChange(null, false, false, false);
                }
            });
            // Add mouse:down listener for bring-to-front behavior
            canvas.on('mouse:down', handleMouseDown);

            return () => {
                canvas.off('selection:created', handleSelectionChange);
                canvas.off('selection:updated', handleSelectionChange);
                canvas.off('selection:cleared');
                canvas.off('mouse:down', handleMouseDown);
                canvas.dispose();
                fabricCanvas.current = null;
            };
        }, []); // Run once on mount

        // Handle prop updates
        useEffect(() => {
            if (fabricCanvas.current) {
                // We handle resizing via imperative handle mainly, but this catches props
            }
        }, [width, height, backgroundColor]);

        useImperativeHandle(ref, () => ({
            canvas: fabricCanvas.current,

            resizeCanvas: (w, h) => {
                if (fabricCanvas.current) {
                    fabricCanvas.current.setDimensions({ width: w, height: h });
                    fabricCanvas.current.requestRenderAll();
                }
            },

            setCanvasBackground: (color) => {
                if (fabricCanvas.current) {
                    fabricCanvas.current.backgroundColor = color;
                    fabricCanvas.current.requestRenderAll();
                }
            },

            loadFromJSON: async (json) => {
                if (!fabricCanvas.current) return;

                const canvas = fabricCanvas.current;

                // Separate image objects from other objects
                const imageObjects: any[] = [];
                const otherObjects: any[] = [];

                for (const obj of json.objects || []) {
                    if (obj.type === 'image') {
                        imageObjects.push(obj);
                    } else {
                        otherObjects.push(obj);
                    }
                }

                // Set background
                if (json.background) {
                    canvas.backgroundColor = json.background;
                }

                // Clear existing objects
                canvas.clear();
                if (json.background) {
                    canvas.backgroundColor = json.background;
                }

                // Load non-image objects first
                if (otherObjects.length > 0) {
                    await canvas.loadFromJSON({ objects: otherObjects, background: json.background });
                }

                // Load image objects with crossOrigin set
                for (const imgObj of imageObjects) {
                    try {
                        const imgSrc = imgObj.src;
                        if (!imgSrc) {
                            console.warn('Skipping image object with no src');
                            continue;
                        }

                        // Route Firebase Storage URLs through our backend proxy to avoid CORS issues
                        const proxiedSrc = getProxiedImageUrl(imgSrc);

                        // Load image with crossOrigin
                        const loadImageElement = (src: string): Promise<HTMLImageElement> => {
                            return new Promise((resolve, reject) => {
                                const imgElement = new Image();
                                imgElement.crossOrigin = 'anonymous';
                                imgElement.onload = () => resolve(imgElement);
                                imgElement.onerror = () => reject(new Error(`Failed to load image from: ${src.substring(0, 100)}...`));
                                imgElement.src = src;
                            });
                        };

                        const imgElement = await loadImageElement(proxiedSrc);
                        const fabricImg = new FabricImage(imgElement);

                        // Apply properties from JSON
                        fabricImg.set({
                            left: imgObj.left || 0,
                            top: imgObj.top || 0,
                            angle: imgObj.angle || 0,
                            flipX: imgObj.flipX || false,
                            flipY: imgObj.flipY || false,
                            opacity: imgObj.opacity ?? 1,
                            originX: imgObj.originX || 'left',
                            originY: imgObj.originY || 'top',
                        });

                        // Handle scaling
                        if (imgObj.scaleToWidth) {
                            fabricImg.scaleToWidth(imgObj.scaleToWidth);
                        } else if (imgObj.scaleToHeight) {
                            fabricImg.scaleToHeight(imgObj.scaleToHeight);
                        } else {
                            fabricImg.set({
                                scaleX: imgObj.scaleX || 1,
                                scaleY: imgObj.scaleY || 1,
                            });
                        }

                        canvas.add(fabricImg);
                    } catch (error) {
                        // Log with more details - the error event object doesn't stringify well
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        console.error(`Failed to load image in loadFromJSON: ${errorMessage}`);
                        console.error('Image object that failed:', imgObj);
                    }
                }

                canvas.requestRenderAll();
            },

            addText: (text, options = {}) => {
                if (fabricCanvas.current) {
                    const textbox = new Textbox(text, {
                        left: 50,
                        top: 50,
                        fontFamily: 'Inter',
                        fontSize: 24,
                        fill: '#000000',
                        ...options
                    });
                    fabricCanvas.current.add(textbox);
                    fabricCanvas.current.setActiveObject(textbox);
                    handleSelectionChange();
                }
            },

            addImage: async (url) => {
                if (fabricCanvas.current) {
                    try {
                        // Check if this is an SVG file
                        const isSvg = url.toLowerCase().includes('.svg');

                        if (isSvg) {
                            // Use Fabric's SVG loading for better SVG support
                            const { loadSVGFromURL, util } = await import('fabric');

                            loadSVGFromURL(url, undefined, { crossOrigin: 'anonymous' }).then((result) => {
                                const validObjects = (result.objects || []).filter((obj): obj is NonNullable<typeof obj> => obj !== null);
                                if (validObjects.length > 0) {
                                    // Group all SVG elements together
                                    const svgGroup = util.groupSVGElements(validObjects, result.options);

                                    // Scale if needed
                                    if (svgGroup.width && svgGroup.width > width / 2) {
                                        svgGroup.scaleToWidth(width / 2);
                                    }

                                    fabricCanvas.current?.add(svgGroup);
                                    fabricCanvas.current?.centerObject(svgGroup);
                                    fabricCanvas.current?.setActiveObject(svgGroup);
                                    fabricCanvas.current?.requestRenderAll();
                                    handleSelectionChange();
                                    console.log('SVG loaded successfully');
                                } else {
                                    console.error('No objects found in SVG');
                                    alert('Could not load SVG - it may be empty or corrupted.');
                                }
                            }).catch((err) => {
                                console.error('SVG load error:', err);
                                alert('Failed to load SVG image.');
                            });
                        } else {
                            // Regular image loading for non-SVG files
                            const loadImageElement = (src: string): Promise<HTMLImageElement> => {
                                return new Promise((resolve, reject) => {
                                    const imgElement = new Image();
                                    imgElement.crossOrigin = 'anonymous';
                                    imgElement.onload = () => {
                                        console.log(`Image loaded: ${imgElement.width}x${imgElement.height}`);
                                        resolve(imgElement);
                                    };
                                    imgElement.onerror = (e) => {
                                        console.error('Image load error:', e);
                                        reject(e);
                                    };
                                    imgElement.src = src;
                                });
                            };

                            const imgElement = await loadImageElement(url);
                            const img = new FabricImage(imgElement);

                            if (img.width && img.width > width / 2) {
                                img.scaleToWidth(width / 2);
                            }

                            fabricCanvas.current.add(img);
                            fabricCanvas.current.centerObject(img);
                            fabricCanvas.current.setActiveObject(img);
                            fabricCanvas.current.requestRenderAll();
                            handleSelectionChange();
                        }
                    } catch (error) {
                        console.error('Failed to load image:', error);
                        alert('Failed to load image. Please try uploading from your device instead.');
                    }
                }
            },

            addRect: (options = {}) => {
                if (fabricCanvas.current) {
                    const rect = new Rect({
                        left: 100,
                        top: 100,
                        fill: '#3b82f6',
                        stroke: '#1d4ed8',
                        strokeWidth: 2,
                        width: 100,
                        height: 100,
                        rx: 0,
                        ry: 0,
                        ...options
                    });
                    fabricCanvas.current.add(rect);
                    fabricCanvas.current.setActiveObject(rect);
                    handleSelectionChange();
                }
            },

            addCircle: (options = {}) => {
                if (fabricCanvas.current) {
                    const circle = new Circle({
                        left: 100,
                        top: 100,
                        radius: 50,
                        fill: '#22c55e',
                        stroke: '#15803d',
                        strokeWidth: 2,
                        ...options
                    });
                    fabricCanvas.current.add(circle);
                    fabricCanvas.current.setActiveObject(circle);
                    handleSelectionChange();
                }
            },

            addTriangle: (options = {}) => {
                if (fabricCanvas.current) {
                    const triangle = new Triangle({
                        left: 100,
                        top: 100,
                        width: 100,
                        height: 100,
                        fill: '#f59e0b',
                        stroke: '#b45309',
                        strokeWidth: 2,
                        ...options
                    });
                    fabricCanvas.current.add(triangle);
                    fabricCanvas.current.setActiveObject(triangle);
                    handleSelectionChange();
                }
            },

            addStar: (options = {}) => {
                if (fabricCanvas.current) {
                    const points = createStarPoints(50, 25, 5);
                    const star = new Polygon(points, {
                        left: 100,
                        top: 100,
                        fill: '#eab308',
                        stroke: '#a16207',
                        strokeWidth: 2,
                        ...options
                    });
                    fabricCanvas.current.add(star);
                    fabricCanvas.current.setActiveObject(star);
                    handleSelectionChange();
                }
            },

            addPolygon: (sides: number, options = {}) => {
                if (fabricCanvas.current) {
                    const points = createPolygonPoints(50, sides);
                    const polygon = new Polygon(points, {
                        left: 100,
                        top: 100,
                        fill: '#8b5cf6',
                        stroke: '#6d28d9',
                        strokeWidth: 2,
                        ...options
                    });
                    fabricCanvas.current.add(polygon);
                    fabricCanvas.current.setActiveObject(polygon);
                    handleSelectionChange();
                }
            },

            addLine: (options = {}) => {
                if (fabricCanvas.current) {
                    const line = new Line([50, 100, 200, 100], {
                        stroke: '#000000',
                        strokeWidth: 3,
                        ...options
                    });
                    fabricCanvas.current.add(line);
                    fabricCanvas.current.setActiveObject(line);
                    handleSelectionChange();
                }
            },

            addArrow: (options = {}) => {
                if (fabricCanvas.current) {
                    // Create an arrow using a path
                    const arrow = new Path('M 0 0 L 100 0 L 85 -10 M 100 0 L 85 10', {
                        left: 100,
                        top: 100,
                        stroke: '#000000',
                        strokeWidth: 3,
                        fill: 'transparent',
                        ...options
                    });
                    fabricCanvas.current.add(arrow);
                    fabricCanvas.current.setActiveObject(arrow);
                    handleSelectionChange();
                }
            },

            addCurvedLine: (options = {}) => {
                if (fabricCanvas.current) {
                    // Create a curved line using a quadratic bezier path
                    const curved = new Path('M 0 50 Q 75 0 150 50', {
                        left: 100,
                        top: 100,
                        stroke: '#000000',
                        strokeWidth: 3,
                        fill: 'transparent',
                        ...options
                    });
                    fabricCanvas.current.add(curved);
                    fabricCanvas.current.setActiveObject(curved);
                    handleSelectionChange();
                }
            },

            clearCanvas: () => {
                if (fabricCanvas.current) {
                    fabricCanvas.current.clear();
                    fabricCanvas.current.backgroundColor = backgroundColor;
                    fabricCanvas.current.requestRenderAll();
                }
            },

            exportAsImage: (format = 'png') => {
                if (fabricCanvas.current) {
                    return fabricCanvas.current.toDataURL({
                        format,
                        quality: 1,
                        multiplier: 1,
                    });
                }
                return '';
            },

            // Text formatting methods
            updateTextProperty: (property: string, value: any) => {
                if (!fabricCanvas.current) return;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && activeObject instanceof Textbox) {
                    activeObject.set(property as keyof Textbox, value);
                    fabricCanvas.current.requestRenderAll();
                }
            },

            getSelectedTextProperties: (): TextProperties | null => {
                if (!fabricCanvas.current) return null;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && activeObject instanceof Textbox) {
                    return {
                        fontFamily: activeObject.fontFamily || 'Inter',
                        fontSize: activeObject.fontSize || 24,
                        fill: (activeObject.fill as string) || '#000000',
                        fontWeight: (activeObject.fontWeight as string) || 'normal',
                        fontStyle: activeObject.fontStyle || 'normal',
                        underline: activeObject.underline || false,
                        textAlign: activeObject.textAlign || 'left',
                        lineHeight: activeObject.lineHeight || 1.16,
                        charSpacing: activeObject.charSpacing || 0,
                    };
                }
                return null;
            },

            // Shape formatting methods
            updateShapeProperty: (property: string, value: any) => {
                if (!fabricCanvas.current) return;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isShapeObject(activeObject)) {
                    activeObject.set(property as any, value);
                    fabricCanvas.current.requestRenderAll();
                }
            },

            getSelectedShapeProperties: (): ShapeProperties | null => {
                if (!fabricCanvas.current) return null;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isShapeObject(activeObject)) {
                    const rect = activeObject as Rect;
                    return {
                        fill: (activeObject.fill as string) || '#3b82f6',
                        stroke: (activeObject.stroke as string) || '#000000',
                        strokeWidth: activeObject.strokeWidth || 0,
                        opacity: activeObject.opacity || 1,
                        rx: rect.rx || 0,
                        ry: rect.ry || 0,
                    };
                }
                return null;
            },

            // Image formatting methods
            updateImageProperty: (property: string, value: any) => {
                if (!fabricCanvas.current) return;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isImageObject(activeObject)) {
                    activeObject.set(property as any, value);
                    fabricCanvas.current.requestRenderAll();
                }
            },

            getSelectedImageProperties: (): ImageProperties | null => {
                if (!fabricCanvas.current) return null;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isImageObject(activeObject)) {
                    return {
                        opacity: activeObject.opacity || 1,
                        scaleX: activeObject.scaleX || 1,
                        scaleY: activeObject.scaleY || 1,
                    };
                }
                return null;
            },

            getSelectedImageDataUrl: (): string | null => {
                if (!fabricCanvas.current) return null;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isImageObject(activeObject)) {
                    const imgObj = activeObject as FabricImage;
                    // Export the image object to a data URL
                    return imgObj.toDataURL({
                        format: 'png',
                        quality: 1,
                    });
                }
                return null;
            },

            replaceSelectedImage: async (dataUrl: string): Promise<void> => {
                if (!fabricCanvas.current) return;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isImageObject(activeObject)) {
                    // Store the position and scale of the current image
                    const currentProps = {
                        left: activeObject.left,
                        top: activeObject.top,
                        scaleX: activeObject.scaleX,
                        scaleY: activeObject.scaleY,
                        angle: activeObject.angle,
                        flipX: activeObject.flipX,
                        flipY: activeObject.flipY,
                    };

                    // Load the new image
                    const loadImageElement = (src: string): Promise<HTMLImageElement> => {
                        return new Promise((resolve, reject) => {
                            const imgElement = new Image();
                            imgElement.crossOrigin = 'anonymous';
                            imgElement.onload = () => resolve(imgElement);
                            imgElement.onerror = (e) => reject(e);
                            imgElement.src = src;
                        });
                    };

                    try {
                        const imgElement = await loadImageElement(dataUrl);
                        const newImg = new FabricImage(imgElement);

                        // Apply the same position and scale as the original
                        newImg.set(currentProps);

                        // Remove old image and add new one
                        fabricCanvas.current.remove(activeObject);
                        fabricCanvas.current.add(newImg);
                        fabricCanvas.current.setActiveObject(newImg);
                        fabricCanvas.current.requestRenderAll();
                        handleSelectionChange();
                    } catch (error) {
                        console.error('Failed to replace image:', error);
                    }
                }
            },

            flipImage: (direction: 'horizontal' | 'vertical') => {
                if (!fabricCanvas.current) return;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isImageObject(activeObject)) {
                    if (direction === 'horizontal') {
                        activeObject.set('flipX', !activeObject.flipX);
                    } else {
                        activeObject.set('flipY', !activeObject.flipY);
                    }
                    fabricCanvas.current.requestRenderAll();
                }
            },

            fitImageToCanvas: () => {
                if (!fabricCanvas.current) return;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isImageObject(activeObject)) {
                    const canvasWidth = fabricCanvas.current.getWidth();
                    const canvasHeight = fabricCanvas.current.getHeight();
                    const imgWidth = activeObject.width || 1;
                    const imgHeight = activeObject.height || 1;

                    const scaleX = canvasWidth / imgWidth;
                    const scaleY = canvasHeight / imgHeight;
                    const scale = Math.min(scaleX, scaleY);

                    activeObject.set({
                        scaleX: scale,
                        scaleY: scale,
                    });
                    fabricCanvas.current.centerObject(activeObject);
                    fabricCanvas.current.requestRenderAll();
                }
            },

            resetImageSize: () => {
                if (!fabricCanvas.current) return;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject && isImageObject(activeObject)) {
                    activeObject.set({
                        scaleX: 1,
                        scaleY: 1,
                    });
                    fabricCanvas.current.requestRenderAll();
                }
            },

            deleteSelected: () => {
                if (!fabricCanvas.current) return;
                const activeObject = fabricCanvas.current.getActiveObject();
                if (activeObject) {
                    fabricCanvas.current.remove(activeObject);
                    fabricCanvas.current.requestRenderAll();
                }
            },

            getCanvasState: () => {
                if (!fabricCanvas.current) return null;
                return fabricCanvas.current.toJSON();
            },
        }));

        return <canvas ref={canvasEl} />;
    }
);

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;


