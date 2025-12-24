export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface GeneratedVideo {
  url: string;
  prompt: string;
}

export enum AppMode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT',
  ANIMATE = 'ANIMATE'
}

export interface ToastMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}