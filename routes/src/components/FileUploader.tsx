"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

const Text = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-gray-500">{children}</p>;
};

const FileUploader = ({
  onFileDrop = (_) => {
    return;
  }, // drop event
  onFileChange = (_) => {
    return;
  }, // button click event
  buttonLabel = "Select file to upload",
  dropZoneLabel = "Drag & drop files here",
  acceptedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
  ],
  limit = 5,
}: {
  onFileDrop?: (files: File[]) => void;
  onFileChange?: (files: File[]) => void;
  buttonLabel?: string;
  dropZoneLabel?: string;
  acceptedFileTypes?: string[];
  limit?: number;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    let droppedFiles = Array.from(event.dataTransfer.files);

    // Handle file limit restriction
    if (limit !== null && droppedFiles.length > limit) {
      droppedFiles = droppedFiles.slice(0, limit); // Keep only the allowed number of files
    }

    const validFiles = droppedFiles.filter((file) =>
      acceptedFileTypes.some(
        (type) => file.type.startsWith(type) || file.name.endsWith(type)
      )
    );

    setFiles(validFiles);
    onFileDrop(validFiles);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let selectedFiles = Array.from(event.target.files || []);

    if (limit !== null && selectedFiles.length > limit) {
      selectedFiles = selectedFiles.slice(0, limit);
    }

    const validFiles = selectedFiles.filter((file) =>
      acceptedFileTypes.some(
        (type) => file.type.startsWith(type) || file.name.endsWith(type)
      )
    );

    setFiles(validFiles);
    onFileChange(validFiles);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center hover:border-gray-400 ${
          isDragging ? "border-blue-500 bg-blue-50" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        ref={dropRef}
      >
        <div className="text-sm text-gray-600">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Text className="mt-4 text-lg font-medium">{dropZoneLabel}</Text>
          <Text className="mt-2 text-sm text-gray-500">or</Text>
          <Button
            onClick={handleButtonClick}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            aria-label="Select file to upload"
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
      <input
        type="file"
        aria-label="File input"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple
      />
      {files && files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Selected files</h4>
          <ul className="mt-2 divide-y divide-gray-200 rounded-md border border-gray-200">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
              >
                <div className="flex w-0 flex-1 items-center">
                  <span className="ml-2 w-0 flex-1 truncate">{file.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
