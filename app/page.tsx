"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { EmptyState } from "@/components/empty-state";

const Halftoner = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImageFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        setImage(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const onImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadImageFromFile(file);
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
  }, [image]);

  return (
    <main className="container mx-auto p-8 bg-background text-foreground">
      <a href="/">
        <h1 className="text-4xl font-light italic mb-8 lowercase">
          halftoner.
        </h1>
      </a>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          ref={fileInputRef}
          className="hidden"
        />

        <div className="md:col-span-2 bg-muted rounded-lg shadow-sm overflow-hidden">
          {image ? (
            <canvas
              ref={canvasRef}
              className="mx-auto w-full max-w-md h-auto"
            />
          ) : (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
              <EmptyState
                title="no image selected"
                description="paste an image or upload a file to begin"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Halftoner;
