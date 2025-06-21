import React, { useRef, useEffect, useState } from "react";
import * as fabric from "fabric";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFDrawingCanvasProps {
  pdfUrl: string;
  initialPage?: number;
  onSave: (drawingData: DrawingData[]) => void;
  onClose: () => void;
}

interface DrawingData {
  type: "rect";
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

const PDFDrawingCanvasPDFJS: React.FC<PDFDrawingCanvasProps> = ({
  pdfUrl,
  initialPage = 1,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const [boxColor] = useState("#FF0000");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfScale, setPdfScale] = useState(1);
  const [pdfPageDimensions, setPdfPageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = window.innerHeight * 0.8;

    // Initialize Fabric.js canvas
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: false,
      width: containerWidth,
      height: containerHeight,
      backgroundColor: "transparent",
    });

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Load PDF document
    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDoc = await loadingTask.promise;
        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        
        // Render first page
        await renderPage(pdfDoc, currentPage, canvas, containerWidth, containerHeight);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPDF();

    // Handle window resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = window.innerHeight * 0.8;
      canvas.setDimensions({ width: newWidth, height: newHeight });
      
      // Re-render current page with new dimensions
      if (pdfDocRef.current) {
        renderPage(pdfDocRef.current, currentPage, canvas, newWidth, newHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, [pdfUrl]);

  // Re-render page when currentPage changes
  useEffect(() => {
    if (pdfDocRef.current && fabricCanvasRef.current) {
      const container = canvasRef.current?.parentElement;
      if (container) {
        renderPage(
          pdfDocRef.current,
          currentPage,
          fabricCanvasRef.current,
          container.clientWidth,
          window.innerHeight * 0.8
        );
      }
    }
  }, [currentPage]);

  const renderPage = async (
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    canvas: fabric.Canvas,
    containerWidth: number,
    containerHeight: number
  ) => {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      
      // Calculate scale to fit container while maintaining aspect ratio
      const scale = Math.min(
        containerWidth / viewport.width,
        containerHeight / viewport.height
      );
      
      const scaledViewport = page.getViewport({ scale });
      setPdfScale(scale);
      setPdfPageDimensions({ 
        width: viewport.width, 
        height: viewport.height 
      });

      // Create a temporary canvas for PDF rendering
      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");
      if (!tempContext) return;

      tempCanvas.width = scaledViewport.width;
      tempCanvas.height = scaledViewport.height;

      // Render PDF page to temporary canvas
      const renderContext = {
        canvasContext: tempContext,
        viewport: scaledViewport,
      };

      await page.render(renderContext).promise;

      // Convert temporary canvas to Fabric.js image
      const fabricImage = new fabric.FabricImage(tempCanvas, {
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
      });

      // Set canvas size to match rendered PDF page
      canvas.setDimensions({
        width: scaledViewport.width,
        height: scaledViewport.height,
      });

      // Clear existing objects except rectangles (annotations)
      const existingRects = canvas.getObjects().filter(obj => obj instanceof fabric.Rect);
      canvas.clear();
      canvas.backgroundImage = fabricImage;
      
      // Re-add existing rectangles
      existingRects.forEach(rect => canvas.add(rect));
      
      canvas.renderAll();
    } catch (error) {
      console.error("Error rendering PDF page:", error);
    }
  };

  const addBox = () => {
    if (!fabricCanvasRef.current) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 400,
      height: 40,
      fill: boxColor,
      opacity: 0.5,
      strokeWidth: 2,
      stroke: boxColor,
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const handleSave = () => {
    if (!fabricCanvasRef.current) return;

    // Convert canvas objects to PDF coordinates
    const vectorData: DrawingData[] = fabricCanvasRef.current
      .getObjects()
      .filter(obj => obj instanceof fabric.Rect)
      .map((obj) => {
        const pdfCoords = canvasToPDFCoordinates(obj);
        return {
          type: "rect",
          left: pdfCoords.left,
          top: pdfCoords.top,
          width: pdfCoords.width,
          height: pdfCoords.height,
          color: obj.fill as string,
          opacity: obj.opacity || 0.5,
        };
      });

    onSave(vectorData);
  };

  // Convert canvas coordinates to actual PDF coordinates
  const canvasToPDFCoordinates = (obj: fabric.Object) => {
    // Since we're rendering the PDF directly with PDF.js, we can use the exact scale
    return {
      left: obj.left! / pdfScale,
      top: obj.top! / pdfScale,
      width: (obj.width! * obj.scaleX!) / pdfScale,
      height: (obj.height! * obj.scaleY!) / pdfScale,
    };
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
      <div className="flex justify-between mb-4">
        <div className="space-x-4">
          <button
            onClick={addBox}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Add Box
          </button>
          {totalPages > 1 && (
            <div className="inline-flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                ←
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                →
              </button>
            </div>
          )}
        </div>
        <div className="space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PDFDrawingCanvasPDFJS;