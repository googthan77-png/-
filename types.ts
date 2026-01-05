export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    sourceId?: string;
    title?: string;
    uri?: string;
    address?: string; // Added address
    phoneNumber?: string; // Added phone number placeholder
    websiteUri?: string; // Added website URI
    placeAnswerSources?: {
      reviewSnippets?: {
        reviewText?: string;
        author?: string;
      }[];
    };
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  groundingSupports: any[]; // We focus mainly on chunks for links/titles
}

export interface SearchResult {
  text: string;
  chunks: GroundingChunk[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  GETTING_LOCATION = 'GETTING_LOCATION',
  SEARCHING = 'SEARCHING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}