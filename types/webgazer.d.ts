declare global {
  interface Window {
    webgazer?: WebGazer;
  }
}

export interface WebGazerData {
  x: number;
  y: number;
}

export interface WebGazer {
  setRegression(model: string): WebGazer;
  setGazeListener(
    listener: (data: WebGazerData | null, elapsedTime: number) => void
  ): WebGazer;
  begin(): Promise<void>;
  end(): Promise<void>;
  saveDataAcrossSessions(enabled: boolean): WebGazer;
  showVideoPreview(enabled: boolean): WebGazer;
  showPredictionPoints(enabled: boolean): WebGazer;
  showFaceOverlay(enabled: boolean): WebGazer;
  showFaceFeedbackBox(enabled: boolean): WebGazer;
  clearData(): void;
}

export {};
