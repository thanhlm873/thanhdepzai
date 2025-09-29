import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    const startCamera = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setIsLoading(false);
            };
          }
        } else {
          throw new Error("Trình duyệt không hỗ trợ truy cập camera.");
        }
      } catch (err) {
        console.error("Lỗi truy cập camera:", err);
        if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
          setError("Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.");
        } else {
          setError("Không thể truy cập camera. Vui lòng kiểm tra thiết bị của bạn.");
        }
        setIsLoading(false);
      }
    };

    startCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg');
      }
      onClose(); // Close after capturing
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-dark-surface rounded-lg border border-dark-border p-4 shadow-2xl w-full max-w-2xl relative">
        <h3 className="text-lg font-semibold mb-4 text-center">Chụp ảnh</h3>
        <div className="relative aspect-video bg-dark-bg rounded-md overflow-hidden flex items-center justify-center">
          {isLoading && <Loader2 className="h-12 w-12 text-neon-cyan animate-spin" />}
          {error && <p className="text-red-400 p-4 text-center">{error}</p>}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${isLoading || error ? 'hidden' : ''}`}
          />
        </div>
        <div className="mt-6 flex justify-center items-center">
            <button
                onClick={handleCapture}
                disabled={isLoading || !!error}
                className="w-20 h-20 bg-white rounded-full border-4 border-dark-surface shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center transition-transform active:scale-95"
                aria-label="Chụp ảnh"
            >
                <div className="w-16 h-16 bg-white rounded-full border-2 border-dark-border group-hover:bg-gray-200 transition-colors"></div>
            </button>
        </div>
         <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-dark-bg/50 rounded-full hover:bg-dark-border transition-colors"
          aria-label="Đóng camera"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
