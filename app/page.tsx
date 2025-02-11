"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, ImageIcon, Link as LinkIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

const Halftoner = () => {
  const [dotSize, setDotSize] = useState(10);
  const [selectedPattern, setSelectedPattern] = useState("dot");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImageFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => setImage(img);
    };
    reader.readAsDataURL(file);
  };

  const onImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImageFromFile(file);
    }
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "halftoned-image.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const drawDot = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    dotSize: number,
    factor: number
  ) => {
    const radius = (dotSize / 2) * factor;
    if (radius > 0.5) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "black";
      ctx.fill();
    }
  };

  const drawSquare = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    dotSize: number,
    factor: number
  ) => {
    const size = dotSize * factor;
    if (size > 0.5) {
      const half = size / 2;
      ctx.fillStyle = "black";
      ctx.fillRect(cx - half, cy - half, size, size);
    }
  };

  const drawTriangle = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    dotSize: number,
    factor: number
  ) => {
    const size = dotSize * factor;
    if (size > 0.5) {
      const height = (size * Math.sqrt(3)) / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - (2 / 3) * height);
      ctx.lineTo(cx - size / 2, cy + (1 / 3) * height);
      ctx.lineTo(cx + size / 2, cy + (1 / 3) * height);
      ctx.closePath();
      ctx.fillStyle = "black";
      ctx.fill();
    }
  };

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    dotSize: number,
    factor: number
  ) => {
    const length = dotSize * factor;
    if (length > 1) {
      ctx.beginPath();
      ctx.moveTo(cx - length / 2, cy);
      ctx.lineTo(cx + length / 2, cy);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const drawCross = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    dotSize: number,
    factor: number
  ) => {
    const length = dotSize * factor;
    if (length > 1) {
      ctx.beginPath();
      ctx.moveTo(cx - length / 2, cy);
      ctx.lineTo(cx + length / 2, cy);
      ctx.moveTo(cx, cy - length / 2);
      ctx.lineTo(cx, cy + length / 2);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  type DrawFunction = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    dotSize: number,
    factor: number
  ) => void;

  const patternDrawFunctions: Record<string, DrawFunction> = {
    dot: drawDot,
    square: drawSquare,
    triangle: drawTriangle,
    line: drawLine,
    cross: drawCross,
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < image.height; y += dotSize) {
      for (let x = 0; x < image.width; x += dotSize) {
        const i = (y * image.width + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const brightness = (r + g + b) / 3;
        const factor = 1 - brightness / 255;
        const cx = x + dotSize / 2;
        const cy = y + dotSize / 2;

        const drawPattern = patternDrawFunctions[selectedPattern];
        if (drawPattern) {
          drawPattern(ctx, cx, cy, dotSize, factor);
        }
      }
    }
  }, [image, dotSize, selectedPattern]);

  return (
    <main className="container mx-auto p-8 bg-background text-foreground">
      <Link href="/">
        <h1 className="text-4xl font-light italic mb-8 lowercase">
          halftoner.
        </h1>
      </Link>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          ref={fileInputRef}
          className="hidden"
        />

        <div className="space-y-8 md:col-span-2">
          <div className="p-6 bg-card rounded-lg shadow-sm">
            <p className="mb-2 lowercase">select halftone pattern:</p>
            <Select onValueChange={setSelectedPattern} defaultValue="dot">
              <SelectTrigger className="w-full lowercase">
                <SelectValue placeholder="select a pattern" />
              </SelectTrigger>
              <SelectContent>
                {["dot", "square", "triangle", "line", "cross"].map(
                  (pattern) => (
                    <SelectItem
                      key={pattern}
                      value={pattern}
                      className="lowercase"
                    >
                      {pattern}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="p-6 bg-card rounded-lg shadow-sm">
            <p className="mb-2 lowercase">adjust dot size: {dotSize}</p>
            <Slider
              value={[dotSize]}
              onValueChange={(value: number[]) => setDotSize(value[0])}
              min={2}
              max={30}
              step={1}
              className="w-full"
            />
          </div>
        </div>

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
                icons={[LinkIcon, ImageIcon, Upload]}
                action={{
                  label: "upload image",
                  onClick: () => fileInputRef.current?.click(),
                }}
                onPaste={loadImageFromFile}
              />
            </div>
          )}
        </div>

        {image && (
          <div className="md:col-span-2">
            <Button
              onClick={downloadImage}
              variant="default"
              className="w-full p-3 font-bold rounded-md"
            >
              download image
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Halftoner;
