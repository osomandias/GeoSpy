
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
