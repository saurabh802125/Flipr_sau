import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ApiService } from '@/services/ApiService';

interface CSVUploadProps {
  onUploadSuccess?: () => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    // Check if file is CSV
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiService.uploadCSV(file);
      
      toast({
        title: "Upload successful",
        description: `${response.count} stocks have been uploaded to the database`,
      });

      setFile(null);
      
      // Trigger refresh
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload Stock Data</h2>
      <p className="text-gray-600 mb-4">
        Upload a CSV file containing stock data. The file should include headers for symbol, name, price, etc.
      </p>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!file || isLoading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          <a 
            href="/sample-stock-template.csv" 
            download
            className="text-primary hover:underline"
          >
            Download sample CSV template
          </a>
        </div>
        
        {file && (
          <div className="text-sm text-gray-600">
            Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVUpload;