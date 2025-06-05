import React from "react";
import importBankStatementStore from "../ImportBankStatement.store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Circle, FileText } from "lucide-react";

const PdfPageSelector: React.FC = () => {
  const pageSelection = importBankStatementStore(
    (state) => state.pageSelection
  );
  const togglePageSelection = importBankStatementStore(
    (state) => state.togglePageSelection
  );
  const isLoading = importBankStatementStore((state) => state.isLoading);
  const previewsLoading = importBankStatementStore(
    (state) => state.previewsLoading
  );
  const setIsDrawingMode = importBankStatementStore(
    (state) => state.setIsDrawingMode
  );
  const setSelectedPageForDrawing = importBankStatementStore(
    (state) => state.setSelectedPageForDrawing
  );

  const submitSelectedPages = importBankStatementStore(
    (state) => state.submitSelectedPages
  );

  const handlePageSelection = (pageNum: number) => {
    togglePageSelection(pageNum);
  };

  const { toast } = useToast();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await submitSelectedPages();
    } catch (error) {
      toast({
        title: "Failed to process selected pages. Please try again.",
        description: "Error processing pages:",
        variant: "destructive",
      });
    }
  };

  if (!pageSelection) return null;

  return (
    <div className="mt-4">
      <div>
        <h3 className="text-lg font-bold">Select Pages</h3>
        <p className="text-sm text-gray-500">
          {pageSelection?.selectedPages.length} of {pageSelection?.numPages}{" "}
          pages selected
        </p>
        <p className="text-sm text-gray-500">
          Your information has not been saved yet.
        </p>
      </div>
      <div className="mt-4 w-full">
        {previewsLoading ? (
          <DocumentPreviewSkeleton pageCount={pageSelection.numPages} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {Array.from(
              { length: pageSelection.numPages },
              (_, i) => i + 1
            ).map((pageNum) => (
              <div key={pageNum} className="relative">
                {pageSelection.previews[pageNum] ? (
                  <img
                    src={pageSelection.previews[pageNum] || ""}
                    alt={`Page ${pageNum}`}
                    className="max-w-full rounded-lg shadow-md"
                  />
                ) : (
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                    {previewsLoading ? (
                      <span>Loading...</span>
                    ) : (
                      <span>Preview failed</span>
                    )}
                  </div>
                )}
                <button
                  aria-label={`Edit page ${pageNum}`}
                  role="button"
                  onClick={() => {
                    setIsDrawingMode(true);
                    setSelectedPageForDrawing(pageNum);
                  }}
                  className="absolute top-2 right-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Edit
                </button>
                <button
                  aria-label={`Select page ${pageNum}`}
                  aria-pressed={pageSelection.selectedPages.includes(pageNum)}
                  role="button"
                  onClick={() => handlePageSelection(pageNum)}
                  className={`absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    pageSelection.selectedPages.includes(pageNum)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {pageSelection.selectedPages.includes(pageNum) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  Page {pageNum}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {pageSelection.selectedPages.length === 0 ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button disabled variant="outline">
                Process Selected Pages
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Please select at least one page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          aria-label="Process selected pages"
          role="button"
          onClick={handleSubmit}
          variant="primary"
        >
          {isLoading ? "Processing..." : "Process Selected Pages"}
        </Button>
      )}
    </div>
  );
};

export default PdfPageSelector;

interface DocumentPreviewSkeletonProps {
  pageCount?: number;
}

function DocumentPreviewSkeleton({
  pageCount = 4,
}: DocumentPreviewSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
      {Array.from({ length: pageCount }, (_, i) => (
        <div key={i} className="relative">
          <div className="aspect-[3/4] w-full rounded-lg border-4 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
            <div className="text-center p-4">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Skeleton className="h-8 w-14" />
          </div>
          <div className="absolute bottom-2 right-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
