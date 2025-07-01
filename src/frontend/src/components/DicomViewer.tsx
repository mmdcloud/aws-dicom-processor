import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Move, Square, Circle, Ruler, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { mockDicomImages } from '../data/mockData';

interface DicomViewerProps {
  studyId?: string;
  className?: string;
}

export function DicomViewer({ studyId = 'S001', className = '' }: DicomViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [windowCenter, setWindowCenter] = useState(40);
  const [windowWidth, setWindowWidth] = useState(400);
  const [tool, setTool] = useState<'pan' | 'zoom' | 'measure' | 'annotate'>('pan');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const images = mockDicomImages.filter(img => img.studyId === studyId);
  const currentImage = images[currentImageIndex];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'pan') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && tool === 'pan') {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 500));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
    setWindowCenter(currentImage?.windowCenter || 40);
    setWindowWidth(currentImage?.windowWidth || 400);
  };

  const handleWindowLevelChange = (center: number, width: number) => {
    setWindowCenter(center);
    setWindowWidth(width);
  };

  if (!currentImage) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <p className="text-gray-500">No DICOM images available for this study</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={tool === 'pan' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTool('pan')}
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'zoom' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTool('zoom')}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'measure' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTool('measure')}
            >
              <Ruler className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'annotate' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTool('annotate')}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Window/Level Controls */}
        <div className="flex items-center space-x-4 mt-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Window Center:</label>
            <input
              type="range"
              min="-1000"
              max="1000"
              value={windowCenter}
              onChange={(e) => handleWindowLevelChange(parseInt(e.target.value), windowWidth)}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-12">{windowCenter}</span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Window Width:</label>
            <input
              type="range"
              min="1"
              max="2000"
              value={windowWidth}
              onChange={(e) => handleWindowLevelChange(windowCenter, parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-12">{windowWidth}</span>
          </div>
        </div>
      </div>

      {/* Image Display Area */}
      <div className="flex">
        {/* Main Viewer */}
        <div
          ref={containerRef}
          className="flex-1 bg-black relative overflow-hidden"
          style={{ height: '600px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={currentImage.imageUrl}
            alt={`DICOM Image ${currentImage.instanceNumber}`}
            className="absolute inset-0 m-auto select-none"
            style={{
              transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
              filter: `contrast(${windowWidth / 400}) brightness(${(windowCenter + 1000) / 2000})`,
              cursor: tool === 'pan' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            draggable={false}
          />

          {/* Image Info Overlay */}
          <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
            <div>Patient: Study {currentImage.studyId}</div>
            <div>Series: {currentImage.seriesNumber}</div>
            <div>Image: {currentImage.instanceNumber}</div>
            <div>Thickness: {currentImage.sliceThickness}mm</div>
          </div>

          {/* Window/Level Overlay */}
          <div className="absolute top-4 right-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
            <div>WC: {windowCenter}</div>
            <div>WW: {windowWidth}</div>
            <div>Zoom: {zoom}%</div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="w-24 bg-gray-50 border-l border-gray-200 p-2">
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-600 text-center">Images</h3>
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-full aspect-square rounded border-2 transition-colors ${
                  index === currentImageIndex
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Image {currentImageIndex + 1} of {images.length}
          </div>
          <div>
            Pixel Spacing: {currentImage.pixelSpacing.join(' x ')} mm
          </div>
          <div>
            Tool: {tool.charAt(0).toUpperCase() + tool.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
}