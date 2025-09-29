
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Share2, Crop, ZoomIn, Brush, Eraser, AlertTriangle, Image as ImageIcon, Facebook, Mail, MessageSquare, FlipHorizontal, FlipVertical, Type, Check, X as CloseIcon } from 'lucide-react';
import ReactCrop, { type Crop as CropType, type PixelCrop } from 'react-image-crop';


interface ImageViewerProps {
  originalImage: string | null;
  editedImage: string | null;
  isLoading: boolean;
  error: string | null;
  isSingleOutputResult?: boolean;
  onApplyEdit: (newImageDataUrl: string, action: string) => void;
}

type ActiveTool = 'crop' | 'draw' | null;

const DRAW_COLORS = ['#FFFFFF', '#000000', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#0EA5E9', '#8B5CF6'];

const DownloadOptions: React.FC<{
  onClose: () => void;
  onConfirm: (format: 'png' | 'jpeg', size: number) => void;
  initialSize: number;
  maxSize: number;
}> = ({ onClose, onConfirm, initialSize, maxSize }) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('jpeg');
  const [size, setSize] = useState<number>(initialSize);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={panelRef} className="absolute bottom-full right-0 mb-2 w-72 bg-dark-surface border border-dark-border rounded-lg shadow-2xl p-4 z-20 animate-fade-in-up">
      <h4 className="font-semibold mb-3 text-base">Tùy chọn tải xuống</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-300">Định dạng</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setFormat('jpeg')} 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${format === 'jpeg' ? 'bg-neon-cyan text-black font-bold' : 'bg-dark-bg hover:bg-dark-border'}`}
            >
              JPG
            </button>
            <button 
              onClick={() => setFormat('png')} 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${format === 'png' ? 'bg-neon-cyan text-black font-bold' : 'bg-dark-bg hover:bg-dark-border'}`}
            >
              PNG
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="size-slider" className="block text-sm font-medium mb-1.5 text-gray-300">
            Kích thước (cạnh dài nhất)
          </label>
          <input 
            type="range" 
            id="size-slider"
            min={Math.min(512, maxSize)} 
            max={maxSize} 
            step="1"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-neon-cyan"
          />
          <div className="text-center text-xs mt-1 font-mono">{size}px</div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-3 py-1.5 text-sm bg-dark-border rounded-md hover:bg-gray-600 transition-colors">
          Hủy
        </button>
        <button onClick={() => onConfirm(format, size)} className="px-3 py-1.5 text-sm bg-neon-cyan text-black font-bold rounded-md hover:opacity-90 transition-opacity">
          Xác nhận
        </button>
      </div>
    </div>
  );
};

const ShareOptions: React.FC<{
  onClose: () => void;
  onShare: (platform: string) => void;
  feedback: string;
}> = ({ onClose, onShare, feedback }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const shareOptions = [
    { name: 'Facebook', icon: Facebook, platform: 'Facebook' },
    { name: 'Zalo', icon: MessageSquare, platform: 'Zalo' },
    { name: 'Email', icon: Mail, platform: 'Email' }
  ];

  return (
    <div ref={panelRef} className="absolute bottom-full left-0 mb-2 w-60 bg-dark-surface border border-dark-border rounded-lg shadow-2xl p-3 z-20 animate-fade-in-up">
      <h4 className="font-semibold mb-2 text-base px-1">Chia sẻ ảnh</h4>
      <div className="flex flex-col gap-1">
        {shareOptions.map(({ name, icon: Icon, platform }) => (
          <button
            key={name}
            onClick={() => onShare(platform)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors hover:bg-dark-border"
          >
            <Icon size={20} className="text-gray-300" />
            <span>Chia sẻ lên {name}</span>
          </button>
        ))}
      </div>
      {feedback && (
        <p className="text-xs text-center text-neon-cyan mt-2 animate-pulse">{feedback}</p>
      )}
    </div>
  );
};


const ImageViewer: React.FC<ImageViewerProps> = ({ originalImage, editedImage, isLoading, error, isSingleOutputResult, onApplyEdit }) => {
  const hasOriginalImage = !!originalImage;
  const hasResult = hasOriginalImage && !!editedImage && (originalImage !== editedImage || isSingleOutputResult);

  const [view, setView] = useState<'original' | 'edited'>('edited');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number}>({width: 0, height: 0});
  
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  
  // Crop states
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  // Draw states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [drawOptions, setDrawOptions] = useState({ color: '#FFFFFF', lineWidth: 5, mode: 'brush' as 'brush' | 'eraser' });

  const MAX_DOWNLOAD_SIZE = 4096;

  let imageToDisplay: string | null = originalImage;
  let altText = "Ảnh gốc";
  
  if (hasResult) {
    if (isSingleOutputResult) {
      imageToDisplay = editedImage;
      altText = "Kết quả ảnh ghép";
    } else {
      imageToDisplay = view === 'original' ? originalImage : editedImage;
      altText = view === 'original' ? 'Ảnh gốc' : 'Đã sửa';
    }
  }

  if(activeTool && editedImage) {
      imageToDisplay = editedImage;
  }
  
  const resizeDrawCanvas = useCallback(() => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (activeTool === 'draw' && image && canvas && image.complete) {
        canvas.width = image.clientWidth;
        canvas.height = image.clientHeight;
    }
  }, [activeTool]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    resizeDrawCanvas();
  };

  useEffect(() => {
    resizeDrawCanvas();
  }, [resizeDrawCanvas]);

  useEffect(() => {
    if (hasResult) {
      setView('edited');
    }
  }, [hasResult]);

  const resetTools = () => {
    setActiveTool(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    const canvas = canvasRef.current;
    if (canvas) {
        const context = canvas.getContext('2d');
        context?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    const imageToFlip = editedImage || originalImage;
    if (!imageToFlip) return;
    
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (direction === 'horizontal') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
        }
        
        ctx.drawImage(img, 0, 0);
        onApplyEdit(canvas.toDataURL(), `Lật ${direction === 'horizontal' ? 'ngang' : 'dọc'}`);
    };
    img.src = imageToFlip;
  };
  
  const handleApplyCrop = () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    onApplyEdit(canvas.toDataURL(), 'Cắt ảnh');
    resetTools();
  };
  
  // Drawing handlers
    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        const context = canvasRef.current?.getContext('2d');
        if (context) {
            context.strokeStyle = drawOptions.color;
            context.lineWidth = drawOptions.lineWidth;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.globalCompositeOperation = drawOptions.mode === 'brush' ? 'source-over' : 'destination-out';
            context.beginPath();
            context.moveTo(offsetX, offsetY);
            isDrawing.current = true;
        }
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        const { offsetX, offsetY } = nativeEvent;
        const context = canvasRef.current?.getContext('2d');
        if (context) {
            context.lineTo(offsetX, offsetY);
            context.stroke();
        }
    };
    
    const stopDrawing = () => {
        isDrawing.current = false;
        const context = canvasRef.current?.getContext('2d');
        if (context) {
            context.closePath();
        }
    };
  
   const handleApplyDraw = () => {
    const baseImage = imgRef.current;
    const drawCanvas = canvasRef.current;
    if (!baseImage || !drawCanvas) return;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = baseImage.naturalWidth;
    newCanvas.height = baseImage.naturalHeight;
    const ctx = newCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(baseImage, 0, 0);
    
    // Draw the overlay canvas on top, scaling it correctly
    ctx.drawImage(drawCanvas, 0, 0, drawCanvas.width, drawCanvas.height, 0, 0, baseImage.naturalWidth, baseImage.naturalHeight);
    
    onApplyEdit(newCanvas.toDataURL(), 'Vẽ');
    resetTools();
  };

  const handleDownload = (format: 'png' | 'jpeg', size: number) => {
    if (!editedImage || !imageDimensions.width) return;

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let newWidth, newHeight;

        if (aspectRatio >= 1) { // Landscape or square
            newWidth = size;
            newHeight = size / aspectRatio;
        } else { // Portrait
            newHeight = size;
            newWidth = size * aspectRatio;
        }
        
        canvas.width = Math.round(newWidth);
        canvas.height = Math.round(newHeight);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, 0.95); // 0.95 quality for jpeg

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `Lê_Thành_Edit_${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownloadOptions(false);
    };
    img.src = editedImage;
  };
  
  const handleShare = async (platform: string) => {
    if (!editedImage) return;

    try {
      setShareFeedback('Đang chuẩn bị ảnh...');
      const response = await fetch(editedImage);
      const blob = await response.blob();
      const file = new File([blob], `Lê_Thành_Edit.png`, { type: blob.type });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ảnh từ Lê Thành Image Editor',
          text: 'Xem bức ảnh tôi vừa tạo!',
        });
        setShareFeedback('');
        setShowShareOptions(false);
        return;
      }
      
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        setShareFeedback(`Đã sao chép! Dán vào ${platform} để chia sẻ.`);
      } else {
        throw new Error('Không hỗ trợ chia sẻ hoặc sao chép.');
      }

    } catch (error) {
      console.error('Share failed:', error);
      if ((error as Error).name === 'AbortError') {
        setShareFeedback('');
      } else {
        setShareFeedback('Lỗi! Vui lòng tải xuống và chia sẻ thủ công.');
      }
    } finally {
      setTimeout(() => setShareFeedback(''), 4000);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-red-400">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h3 className="font-semibold text-lg">Đã xảy ra lỗi</h3>
          <p className="text-sm max-w-md">{error}</p>
        </div>
      );
    }

    if (!hasOriginalImage && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-gray-500">
          <ImageIcon className="w-24 h-24 mb-4" />
          <h3 className="font-semibold text-lg">Khung xem kết quả</h3>
          <p className="text-sm">Tải ảnh lên và chọn một tính năng để bắt đầu.</p>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative">
          {imageToDisplay && (
            activeTool === 'crop' ? (
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
              >
                <img ref={imgRef} src={imageToDisplay} alt={altText} className="max-w-full max-h-full object-contain" onLoad={handleImageLoad} />
              </ReactCrop>
            ) : (
              <img ref={imgRef} src={imageToDisplay} alt={altText} className="max-w-full max-h-full object-contain rounded-lg" onLoad={handleImageLoad} />
            )
          )}
          {activeTool === 'draw' && (
               <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
              />
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border flex flex-col flex-grow p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Khung xem kết quả</h3>
        <div className="flex items-center gap-1 text-gray-300">
            <button onClick={() => setActiveTool(activeTool === 'crop' ? null : 'crop')} className={`p-2 rounded-md transition-colors ${activeTool === 'crop' ? 'bg-neon-cyan/20 text-neon-cyan' : 'hover:bg-dark-border'}`} title="Cắt ảnh"><Crop size={18} /></button>
            <button onClick={() => handleFlip('horizontal')} className="p-2 rounded-md hover:bg-dark-border transition-colors" title="Lật ngang"><FlipHorizontal size={18} /></button>
            <button onClick={() => handleFlip('vertical')} className="p-2 rounded-md hover:bg-dark-border transition-colors" title="Lật dọc"><FlipVertical size={18} /></button>
            <button onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')} className={`p-2 rounded-md transition-colors ${activeTool === 'draw' ? 'bg-neon-cyan/20 text-neon-cyan' : 'hover:bg-dark-border'}`} title="Vẽ"><Brush size={18} /></button>
            <button className="p-2 rounded-md hover:bg-dark-border transition-colors opacity-50 cursor-not-allowed" title="Thêm chữ (sắp có)"><Type size={18} /></button>
            <button className="p-2 rounded-md hover:bg-dark-border transition-colors opacity-50 cursor-not-allowed" title="Phóng to (sắp có)"><ZoomIn size={18} /></button>
        </div>
      </div>
      
      {activeTool && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-dark-bg/80 backdrop-blur-sm p-2 rounded-lg border border-dark-border shadow-lg flex items-center gap-4 animate-fade-in-down">
            {activeTool === 'crop' && (
                <>
                    <span className="text-sm font-semibold">Chế độ Cắt ảnh</span>
                </>
            )}
            {activeTool === 'draw' && (
                <>
                    <span className="text-sm font-semibold mr-2">Chế độ Vẽ</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setDrawOptions(o => ({...o, mode: 'brush'}))} className={`p-2 rounded-md ${drawOptions.mode === 'brush' ? 'bg-neon-cyan/20 text-neon-cyan' : 'hover:bg-dark-border'}`}><Brush size={16}/></button>
                        <button onClick={() => setDrawOptions(o => ({...o, mode: 'eraser'}))} className={`p-2 rounded-md ${drawOptions.mode === 'eraser' ? 'bg-neon-cyan/20 text-neon-cyan' : 'hover:bg-dark-border'}`}><Eraser size={16}/></button>
                    </div>
                     <div className="w-px h-6 bg-dark-border"></div>
                    <div className="flex items-center gap-1.5">
                        {DRAW_COLORS.map(color => (
                            <button key={color} onClick={() => setDrawOptions(o => ({...o, color}))} className={`w-6 h-6 rounded-full border-2 ${drawOptions.color === color ? 'border-neon-cyan' : 'border-transparent'}`} style={{backgroundColor: color}} />
                        ))}
                    </div>
                     <div className="w-px h-6 bg-dark-border"></div>
                    <div className="flex items-center gap-2">
                        <input type="range" min="1" max="50" value={drawOptions.lineWidth} onChange={e => setDrawOptions(o => ({...o, lineWidth: Number(e.target.value)}))} className="w-24 h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer accent-neon-cyan" />
                        <span className="text-xs font-mono w-6 text-center">{drawOptions.lineWidth}</span>
                    </div>
                </>
            )}
             <div className="w-px h-6 bg-dark-border"></div>
            <button onClick={resetTools} className="p-2 rounded-md hover:bg-red-500/20 text-red-400" title="Hủy"><CloseIcon size={18} /></button>
            <button onClick={activeTool === 'crop' ? handleApplyCrop : handleApplyDraw} className="p-2 rounded-md hover:bg-green-500/20 text-green-400" title="Áp dụng"><Check size={18} /></button>
        </div>
      )}

      <div className="relative flex-grow flex items-center justify-center bg-dark-bg rounded-md overflow-hidden p-2">
        {renderContent()}
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="text-xs text-gray-400 font-mono w-full flex justify-between items-center">
          <span>
            {imageDimensions.width > 0 && `Kích thước: ${imageDimensions.width} x ${imageDimensions.height}px`}
          </span>
          {hasResult && !isSingleOutputResult && (
            <span className="font-semibold uppercase text-neon-cyan/80 text-xs">
              Đang xem: {view === 'original' ? 'Ảnh Gốc' : 'Kết Quả'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 p-1.5 bg-dark-bg rounded-full border border-dark-border w-auto shadow-lg">
          {hasResult && !isSingleOutputResult && (
            <>
              <div className="flex items-center bg-dark-surface rounded-full p-1">
                <button 
                  onClick={() => setView('original')}
                  className={`px-4 py-1 text-sm rounded-full transition-colors ${view === 'original' ? 'bg-neon-cyan text-black font-bold' : 'text-gray-300 hover:bg-dark-border'}`}
                  aria-label="Xem ảnh gốc"
                  title="Xem ảnh gốc"
                >
                  Trước
                </button>
                <button 
                  onClick={() => setView('edited')}
                  className={`px-4 py-1 text-sm rounded-full transition-colors ${view === 'edited' ? 'bg-neon-cyan text-black font-bold' : 'text-gray-300 hover:bg-dark-border'}`}
                  aria-label="Xem ảnh đã sửa"
                  title="Xem ảnh đã sửa"
                >
                  Sau
                </button>
              </div>
              <div className="w-px h-6 bg-dark-border"></div>
            </>
          )}

          <div className="flex gap-1">
            <div className="relative">
              <button 
                onClick={() => { setShowShareOptions(p => !p); setShareFeedback(''); }}
                disabled={!hasResult}
                className="p-2.5 bg-dark-surface rounded-full text-gray-300 hover:bg-dark-border hover:text-neon-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-300 disabled:hover:bg-dark-surface"
                title="Chia sẻ"
              >
                <Share2 size={18}/>
              </button>
              {showShareOptions && (
                <ShareOptions
                  onClose={() => setShowShareOptions(false)}
                  onShare={handleShare}
                  feedback={shareFeedback}
                />
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowDownloadOptions(prev => !prev)}
                disabled={!hasResult}
                className="p-2.5 bg-dark-surface rounded-full text-gray-300 hover:bg-dark-border hover:text-neon-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-300 disabled:hover:bg-dark-surface"
                title="Tải xuống"
              >
                <Download size={18}/>
              </button>
              {showDownloadOptions && (
                <DownloadOptions 
                  onClose={() => setShowDownloadOptions(false)}
                  onConfirm={handleDownload}
                  initialSize={Math.min(MAX_DOWNLOAD_SIZE, Math.max(imageDimensions.width, imageDimensions.height))}
                  maxSize={MAX_DOWNLOAD_SIZE}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
