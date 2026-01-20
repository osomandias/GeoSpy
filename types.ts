
export interface AnalysisResult {
  locationName: string;
  description: string;
  country?: string;
  facts: string[];
  googleMapsLinks: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ImageAnalysisState {
  id: string;
  base64: string;
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

export interface AlbumLocationGroup {
  locationName: string;
  country?: string;
  description: string;
  images: string[];
  facts: string[];
}

export interface VideoState {
  isGenerating: boolean;
  progress: string;
  videoUrl: string | null;
  error: string | null;
}
