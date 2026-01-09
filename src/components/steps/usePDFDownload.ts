import { useState } from 'react';

export function usePDFDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = async (applicationId: string, data: any) => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/download-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          data,
        }),
      });

      if (!res.ok) {
        let errorMessage = "Failed to generate PDF";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `application-${applicationId}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to generate PDF. Please check your AWS S3 configuration.";
      
      alert(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadPDF, isDownloading };
}
