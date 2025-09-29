// Fix: Import `ComponentType` from `react` to resolve 'Cannot find namespace "React"' error.
import type { ComponentType } from 'react';

export interface EditingTask {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
}

export interface EditingCategory {
  name: string;
  tasks: EditingTask[];
}

export interface ImagePaletteItem {
  id: string;
  file: File;
  dataUrl: string;
}

export interface HistoryItem {
  id: string;
  imageDataUrl: string;
  action: string;
}
