import React, { useState, useRef, DragEvent } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from './Button';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
  
    setIsUploading(true);
    setUploadProgress(0);
  
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
  
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
  
      const { error: uploadError } = await supabase
        .storage
        .from('space-images')
        .upload(filePath, file);
  
      if (uploadError) {
        alert('Upload failed.');
        console.error('Upload error:', uploadError.message);
        return;
      }
  
      // ✅ Get the public URL
      const { data } = supabase
        .storage
        .from('space-images')
        .getPublicUrl(filePath);
  
      const publicUrl = data.publicUrl;
      console.log("✅ Public URL:", publicUrl);
  
      onImageUploaded(publicUrl); // ← send full URL to parent
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-orange-500'
        }`}
      >
        {isUploading ? (
          <div className="space-y-4">
            <Loader size={48} className="mx-auto text-orange-500 animate-spin" />
            <p className="text-gray-600">Uploading image... {Math.round(uploadProgress)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop your image here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Maximum file size: 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
              >
                Select Image
              </Button>
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;