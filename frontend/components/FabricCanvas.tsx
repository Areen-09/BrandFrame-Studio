'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas, Rect, Textbox, Circle, FabricImage } from 'fabric';

export interface FabricCanvasHandle {
    addText: (text: string, options?: any) => void;
    addImage: (url: string) => void;
    addRect: () => void;
    addCircle: () => void;
    exportAsImage: (format?: 'png' | 'jpeg') => string;
    resizeCanvas: (width: number, height: number) => void;
    setCanvasBackground: (color: string) => void;
    loadFromJSON: (json: any) => void;
    clearCanvas: () => void;
    canvas: Canvas | null;
}

interface FabricCanvasProps {
    width: number;
    height: number;
    backgroundColor?: string;
}

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(({ width, height, backgroundColor = '#ffffff' }, ref) => {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const fabricCanvas = useRef<Canvas | null>(null);

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

        return () => {
            canvas.dispose();
            fabricCanvas.current = null;
        };
    }, []); // Run once on mount

    // Handle prop updates
    useEffect(() => {
        if (fabricCanvas.current) {
            // We handle resizing via imperative handle mainly, but this catches props
            // fabricCanvas.current.setDimensions({ width, height });
            // fabricCanvas.current.backgroundColor = backgroundColor;
            // fabricCanvas.current.requestRenderAll();
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

        loadFromJSON: (json) => {
            if (fabricCanvas.current) {
                fabricCanvas.current.loadFromJSON(json).then(() => {
                    fabricCanvas.current?.requestRenderAll();
                });
            }
        },

        addText: (text, options = {}) => {
            if (fabricCanvas.current) {
                const textbox = new Textbox(text, {
                    left: 50,
                    top: 50,
                    fontFamily: 'sans-serif',
                    fontSize: 24,
                    fill: '#000000',
                    ...options
                });
                fabricCanvas.current.add(textbox);
                fabricCanvas.current.setActiveObject(textbox);
            }
        },

        addImage: async (url) => {
            if (fabricCanvas.current) {
                try {
                    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });

                    if (img.width && img.width > width / 2) {
                        img.scaleToWidth(width / 2);
                    }

                    fabricCanvas.current.add(img);
                    fabricCanvas.current.centerObject(img);
                    fabricCanvas.current.setActiveObject(img);
                } catch (error) {
                    console.error('Failed to load image:', error);
                }
            }
        },

        addRect: () => {
            if (fabricCanvas.current) {
                const rect = new Rect({
                    left: 100,
                    top: 100,
                    fill: '#ff0000',
                    width: 100,
                    height: 100
                });
                fabricCanvas.current.add(rect);
                fabricCanvas.current.setActiveObject(rect);
            }
        },

        addCircle: () => {
            if (fabricCanvas.current) {
                const circle = new Circle({
                    left: 100,
                    top: 100,
                    radius: 50,
                    fill: '#00ff00'
                });
                fabricCanvas.current.add(circle);
                fabricCanvas.current.setActiveObject(circle);
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
    }));

    return <canvas ref={canvasEl} />;
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;
