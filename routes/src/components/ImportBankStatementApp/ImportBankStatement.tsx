import React, { useEffect } from "react";
import FileUploader from "../FileUploader";
import importBankStatementStore from "./ImportBankStatement.store";
import BankStatementDetailsTable from "./components/BankStatementDetailsTable";
import PdfPageSelector from "./components/PdfPageSelector";
import PdfSafetyMarker from "./components/PdfSafetyMarker";
import ImportBankStatementLifecycle from "./ImportBankStatement.lifecycle";
import { LoginModal } from "../Login";
import { useAuthStore } from "@/stores/auth";

const ImportBankStatement: React.FC<{
  labels: {
    title?: string;
    subtitle?: string;
  };
  // This prop is only useful if you're usign this component in a non-authenticated context (e.g. the landing page)
  displayLoginModalOnUnauthorized?: boolean;
}> = ({
  labels = { title: "Import Bank Statement", subtitle: "" },
  displayLoginModalOnUnauthorized = false,
}) => {
  const error = importBankStatementStore((state) => state.error);
  const handleFileChange = importBankStatementStore(
    (state) => state.handleFileChange
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setDisplayLoginModal = useAuthStore(
    (state) => state.setDisplayLoginModal
  );
  const displayLoginModal = useAuthStore((state) => state.displayLoginModal);

  useEffect(() => {
    // if you are unauthorized, we're gonna toss a login modal your way
    const shouldWeDisplayLoginModal =
      error === "You must be logged in to upload a file" &&
      displayLoginModalOnUnauthorized &&
      !isAuthenticated;

    if (shouldWeDisplayLoginModal) {
      setDisplayLoginModal(true);
    }
  }, [isAuthenticated, error]);

  return (
    <ImportBankStatementLifecycle>
      <div className=" p-4">
        {labels?.title && (
          <h2 className="text-2xl font-bold mb-4">{labels.title}</h2>
        )}
        {labels?.subtitle && (
          <p className="text-sm text-stone-500 mb-4">{labels.subtitle}</p>
        )}

        {/* This is hard coded to only accept a single PDF file */}
        {/* TODO: New Feature - Make this accept multiple files */}
        {/* DX Flow - User Uploads a Bank Statement: https://utfs.io/f/5DbNgXh2h3Mzjo7aymrZuVKHWiU458GMeOYaqmCp6BXb0R7S */}
        <FileUploader
          onFileChange={(files) => handleFileChange(files[0])}
          onFileDrop={(files) => handleFileChange(files[0])}
          buttonLabel="Select PDF file"
          acceptedFileTypes={["application/pdf"]}
          onReset={() => {
            importBankStatementStore.getState().reset();
          }}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* 1. After a file is uploaded, the user can select pages to import */}
        <PdfPageSelector />
        {/* 2. (Optional) The user can then draw over the pages to prevent sensitive data from being OCR'd */}
        <PdfSafetyMarker />
        {/* 3. Table view of the data after the user has processed the selected pages */}
        <BankStatementDetailsTable />

        {displayLoginModal && (
          <LoginModal
            open={displayLoginModal}
            onOpenChange={() => setDisplayLoginModal(false)}
          />
        )}
      </div>
    </ImportBankStatementLifecycle>
  );
};

export default ImportBankStatement;
