
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

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
    if (!process.env.API_KEY) {
        setError("API key is not configured. Please set the API_KEY environment variable.");
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contentParts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [];

      // Construct the final prompt for the AI
      const textForAI = activeTask?.id === 'EDIT_NANO_BANANA' 
        ? `${generatePrompt('EDIT_NANO_BANANA')}\n\nYêu cầu của người dùng: "${prompt}"`
        : prompt;

      if (activeTask?.id === 'TREND_FACE_SWAP_MV') {
        if (!faceSwapSourceId || !faceSwapTargetId) {
            setError("Vui lòng chọn ảnh gốc (khuôn mặt) và ảnh đích (cảnh).");
            setIsLoading(false);
            return;
        }
        const sourceImageItem = imagePalette.find(img => img.id === faceSwapSourceId);
        const targetImageItem = imagePalette.find(img => img.id === faceSwapTargetId);

        if (!sourceImageItem || !targetImageItem) {
            setError("Không tìm thấy ảnh đã chọn. Vui lòng thử lại.");
            setIsLoading(false);
            return;
        }
        
        // New robust order: Visual context first (images), then instructions (prompt).
        // The prompt has been updated to reference the images by their order.
        contentParts.push({
            inlineData: { // This is the "first image" (target/scene)
                data: targetImageItem.dataUrl.split(',')[1],
                mimeType: targetImageItem.file.type,
            },
        });
        contentParts.push({
            inlineData: { // This is the "second image" (source/face)
                data: sourceImageItem.dataUrl.split(',')[1],
                mimeType: sourceImageItem.file.type,
            },
        });
        contentParts.push({ text: textForAI });

      } else if (activeTask?.id === 'IMAGE_COLLAGE') {
        if (imagePalette.length < 2) {
            setError("Vui lòng tải lên ít nhất 2 ảnh để tạo khung ảnh ghép.");
            setIsLoading(false);
            return;
        }
        
        contentParts.push({ text: textForAI });
        imagePalette.forEach(imgItem => {
            contentParts.push({
                inlineData: {
                    data: imgItem.dataUrl.split(',')[1],
                    mimeType: imgItem.file.type,
                },
            });
        });

      } else {
        // Use the most recently edited image for AI generation
        const imageToEdit = editedImage || originalImage;
        if (!imageToEdit) {
            setError("Vui lòng tải lên và chọn một ảnh để chỉnh sửa.");
            setIsLoading(false);
            return;
        }
        const base64ImageData = imageToEdit.split(',')[1];
        contentParts.push({
            inlineData: {
                data: base64ImageData,
                mimeType: imageMimeType, // Assume mime type doesn't change with manual edits
            },
        });
        contentParts.push({ text: textForAI });
      }


      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: contentParts,
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      
      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
         if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const newMimeType = part.inlineData.mimeType;
            const imageUrl = `data:${newMimeType};base64,${base64ImageBytes}`;
            
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
            foundImage = true;
            break; 
         }
      }

      if (!foundImage) {
        throw new Error("The AI did not return an image. It might have returned text instead. Please check your prompt.");
      }

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
