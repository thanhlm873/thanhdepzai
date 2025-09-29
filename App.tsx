
import React, { useState, useCallback, useEffect } from 'react';

import type { EditingTask, ImagePaletteItem, HistoryItem } from './types';
import { EDITING_CATEGORIES } from './constants';
import { generatePrompt } from './services/promptService';

import Header from './components/Header';
import Footer from './components/Footer';
import ControlsPanel from './components/ControlsPanel';
import ImageViewer from './components/ImageViewer';
import CameraCapture from './components/CameraCapture';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [imagePalette, setImagePalette] = useState<ImagePaletteItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [faceSwapSourceId, setFaceSwapSourceId] = useState<string | null>(null);
  const [faceSwapTargetId, setFaceSwapTargetId] = useState<string | null>(null);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  
  const [activeTask, setActiveTask] = useState<EditingTask | null>(null);
  const [prompt, setPrompt] = useState<string>('');

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  
  const addStateToHistory = (imageDataUrl: string, action: string) => {
    const newHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      imageDataUrl,
      action,
    };
  
    // If we've reverted and are now making a new edit, truncate the future history
    const newHistory = history.slice(0, currentHistoryIndex + 1);
  
    setHistory([...newHistory, newHistoryItem]);
    setCurrentHistoryIndex(newHistory.length);
    setEditedImage(imageDataUrl); // Also update the main edited image state
  };

  const handleImageSelect = useCallback((image: ImagePaletteItem) => {
    setActiveImageId(image.id);
    setOriginalImage(image.dataUrl);
    setEditedImage(image.dataUrl); // Reset edited image on new selection
    setImageMimeType(image.file.type);
    setError(null);

    // Initialize history
    const initialHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        imageDataUrl: image.dataUrl,
        action: 'Ảnh gốc',
    };
    setHistory([initialHistoryItem]);
    setCurrentHistoryIndex(0);

  }, []);
  
  const handleFilesSelected = (filesToProcess: File[]) => {
    setError(null);
    if (filesToProcess.length === 0) return;

    const newItems: ImagePaletteItem[] = [];
    const wasPaletteEmpty = imagePalette.length === 0;

    filesToProcess.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            newItems.push({
                id: `${Date.now()}-${file.name}-${index}`,
                file: file,
                dataUrl: reader.result as string,
            });

            // When all files are read, update state
            if (newItems.length === filesToProcess.length) {
                const updatedPalette = [...imagePalette, ...newItems];
                setImagePalette(updatedPalette);
                
                if (wasPaletteEmpty && !activeTask) {
                    // First ever upload: set a default task and select the first image
                    const defaultTask = EDITING_CATEGORIES[0].tasks[0];
                    handleTaskSelect(defaultTask);
                    handleImageSelect(newItems[0]);
                } else if (activeTask?.id === 'TREND_FACE_SWAP_MV') {
                    // Face Swap is active: auto-assign source and target
                    const newSourceId = faceSwapSourceId ?? updatedPalette[0]?.id;
                    if(newSourceId) setFaceSwapSourceId(newSourceId);

                    const newTargetId = faceSwapTargetId ?? updatedPalette.find(img => img.id !== newSourceId)?.id;
                    if(newTargetId) setFaceSwapTargetId(newTargetId);

                } else if (!activeImageId && activeTask?.id !== 'IMAGE_COLLAGE') {
                    // Other tasks: if no image is selected, select the first new one
                    handleImageSelect(newItems[0]);
                }
            }
        };
        reader.onerror = () => {
          setError(`Failed to read file: ${file.name}`);
        };
        reader.readAsDataURL(file);
    });
  };
  
  const handleImageUpload = (files: FileList) => {
    const filesToProcess = Array.from(files).slice(0, 4 - imagePalette.length);
    handleFilesSelected(filesToProcess);
  };

  const handleCameraCapture = (imageFile: File) => {
    if (imagePalette.length < 4) {
      handleFilesSelected([imageFile]);
    }
  };

  const handleImageRemove = (idToRemove: string) => {
    const remainingImages = imagePalette.filter(img => img.id !== idToRemove);
    setImagePalette(remainingImages);

    // Clear face swap selections if removed image was part of it
    if (idToRemove === faceSwapSourceId) setFaceSwapSourceId(null);
    if (idToRemove === faceSwapTargetId) setFaceSwapTargetId(null);

    if (activeImageId === idToRemove) {
      if (remainingImages.length > 0) {
        handleImageSelect(remainingImages[0]);
      } else {
        setActiveImageId(null);
        setOriginalImage(null);
        setEditedImage(null);
        setImageMimeType('');
        setHistory([]);
        setCurrentHistoryIndex(-1);
      }
    }
  };

  const handleTaskSelect = useCallback((task: EditingTask) => {
    setActiveTask(task);
    // Reset states that are not relevant for the newly selected task
    if (task.id === 'TREND_FACE_SWAP_MV') {
        setActiveImageId(null); // Face swap uses its own selection, not a single active image
    } else {
        setFaceSwapSourceId(null);
        setFaceSwapTargetId(null);
        // If there are images but none is active, select the first one
        if (imagePalette.length > 0 && !activeImageId) {
            handleImageSelect(imagePalette[0]);
        }
    }
  }, [imagePalette, activeImageId, handleImageSelect]);

  const handleFaceSwapImageSelect = (image: ImagePaletteItem) => {
    const imageId = image.id;

    if (faceSwapSourceId === imageId) { // Click source -> deselect all
        setFaceSwapSourceId(null);
        setFaceSwapTargetId(null);
    } else if (faceSwapTargetId === imageId) { // Click target -> deselect target
        setFaceSwapTargetId(null);
    } else if (!faceSwapSourceId) { // No source -> set source
        setFaceSwapSourceId(imageId);
    } else if (!faceSwapTargetId) { // No target -> set target
        setFaceSwapTargetId(imageId);
    } else { // Both selected -> replace target with new image
        setFaceSwapTargetId(imageId);
    }
  };


  useEffect(() => {
    if (activeTask) {
      if (activeTask.id === 'EDIT_NANO_BANANA') {
        setPrompt(''); // Clear prompt to show placeholder for this specific task
      } else {
        const newPrompt = generatePrompt(activeTask.id);
        setPrompt(newPrompt);
      }
    }
  }, [activeTask]);

  const handleGenerate = async () => {
    if (!activeTask) {
      setError("Vui lòng chọn một tính năng chỉnh sửa.");
      return;
    }
    if (!prompt) {
      setError("Vui lòng nhập mô tả cho yêu cầu của bạn.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const sourceImageItem = imagePalette.find(img => img.id === faceSwapSourceId);
      const targetImageItem = imagePalette.find(img => img.id === faceSwapTargetId);
      const imageToEdit = editedImage || originalImage;

      const apiRequestBody = {
        prompt,
        activeTask,
        imagePalette: activeTask?.id === 'IMAGE_COLLAGE' ? imagePalette.map(p => ({ dataUrl: p.dataUrl, type: p.file.type })) : undefined,
        sourceImage: sourceImageItem ? { dataUrl: sourceImageItem.dataUrl, type: sourceImageItem.file.type } : undefined,
        targetImage: targetImageItem ? { dataUrl: targetImageItem.dataUrl, type: targetImageItem.file.type } : undefined,
        imageToEdit: imageToEdit,
        imageMimeType: imageMimeType,
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred from the API.');
      }
      
      const result = await response.json();
      const imageUrl = result.imageUrl;

      if (!imageUrl) {
         throw new Error("The AI did not return an image. It might have returned text instead. Please check your prompt.");
      }
      
      // For Face Swap, the "original" to compare against is the target image
      if (activeTask?.id === 'TREND_FACE_SWAP_MV' && faceSwapTargetId) {
          const targetImage = imagePalette.find(img => img.id === faceSwapTargetId);
          if (targetImage) {
              setOriginalImage(targetImage.dataUrl);
          }
      } else if (activeTask?.id === 'IMAGE_COLLAGE' && imagePalette.length > 0) {
           setOriginalImage(imagePalette[0].dataUrl); 
      }
      
      addStateToHistory(imageUrl, `AI: ${activeTask?.name || 'Edit'}`);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during image generation.";
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplyManualEdit = (newImageDataUrl: string, action: string) => {
    addStateToHistory(newImageDataUrl, `Thủ công: ${action}`);
  };

  const handleRevertToHistory = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      const targetState = history[index];
      setEditedImage(targetState.imageDataUrl);
      setCurrentHistoryIndex(index);
    }
  }, [history]);

  const handleClearHistory = () => {
    if (history.length > 0) {
      setHistory([history[0]]);
      setCurrentHistoryIndex(0);
      setEditedImage(history[0].imageDataUrl);
    }
  };

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      handleRevertToHistory(currentHistoryIndex - 1);
    }
  }, [canUndo, currentHistoryIndex, handleRevertToHistory]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      handleRevertToHistory(currentHistoryIndex + 1);
    }
  }, [canRedo, currentHistoryIndex, handleRevertToHistory]);


  const canGenerate = activeTask && (
    activeTask.id === 'IMAGE_COLLAGE' 
      ? imagePalette.length >= 2 
      : activeTask.id === 'TREND_FACE_SWAP_MV'
          ? !!faceSwapSourceId && !!faceSwapTargetId
          : !!originalImage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-start via-brand-mid to-brand-end text-white font-sans flex flex-col">
      <Header 
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col gap-4 overflow-y-auto pr-2">
          <ControlsPanel 
            onImageUpload={handleImageUpload}
            imagePalette={imagePalette}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            activeImageId={activeImageId}
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            categories={EDITING_CATEGORIES}
            activeTask={activeTask}
            onTaskSelect={handleTaskSelect}
            canGenerate={!!canGenerate}
            history={history}
            currentHistoryIndex={currentHistoryIndex}
            onRevert={handleRevertToHistory}
            onClearHistory={handleClearHistory}
            faceSwapSourceId={faceSwapSourceId}
            faceSwapTargetId={faceSwapTargetId}
            onFaceSwapImageSelect={handleFaceSwapImageSelect}
            onOpenCamera={() => setIsCameraOpen(true)}
          />
        </div>
        
        <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col">
          <ImageViewer 
            originalImage={originalImage}
            editedImage={editedImage}
            isLoading={isLoading}
            error={error}
            isSingleOutputResult={activeTask?.id === 'IMAGE_COLLAGE' || activeTask?.id === 'TREND_FACE_SWAP_MV'}
            onApplyEdit={handleApplyManualEdit}
          />
        </div>
      </main>

      <Footer />
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <Loader2 className="h-16 w-16 text-neon-cyan animate-spin mb-4" />
          <p className="text-xl text-center">AI đang xử lý, vui lòng chờ trong giây lát...</p>
          <p className="text-sm text-gray-400 mt-2">Chất lượng cao cần thêm thời gian để hoàn thiện.</p>
        </div>
      )}

      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
