export type ToolCategory = 'all' | 'organize' | 'optimize' | 'convert-to' | 'convert-from' | 'edit-sign' | 'security';

export type ExecutionMode = 'client' | 'server';

export interface ToolItem {
  id: string;
  name: string;
  shortDesc: string;
  category: ToolCategory;
  iconName: string;
  badge?: string;
  color: string;
  bgLight: string;
  accentBorder: string;
  route: string;
  acceptedFormats: string[];
  outputFormat: string;
  executionMode: ExecutionMode;
  multiFile?: boolean;
  popular?: boolean;
  instructions: string[];
}

export interface ProcessedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  previewUrl?: string;
  rotation?: number;
  arrayBuffer?: ArrayBuffer;
}

export interface PageThumbnail {
  pageNumber: number; // 1-indexed
  originalPageNumber: number;
  dataUrl?: string;
  rotation: number;
  isDeleted?: boolean;
  isBlank?: boolean;
  width?: number;
  height?: number;
}

export interface JobRecord {
  id: number | string;
  user_id?: string | null;
  tool: string;
  execution_mode: ExecutionMode;
  status: 'succeeded' | 'failed' | 'running' | 'queued';
  input_count: number;
  input_bytes: number;
  output_bytes: number;
  page_count: number;
  duration_ms: number;
  savings_bytes: number;
  file_name: string;
  share_token?: string | null;
  storage_path?: string | null;
  created_at: string;
}

export interface VaultItem {
  id: number;
  user_id: string;
  name: string;
  size: number;
  page_count: number;
  storage_path?: string;
  public_url?: string;
  tags?: string;
  is_starred: boolean;
  last_modified: string;
  created_at: string;
}

export interface WatermarkOptions {
  type: 'text' | 'image';
  text: string;
  imageUrl?: string;
  imageFile?: File;
  fontSize: number;
  fontColor: string;
  opacity: number;
  rotation: number;
  position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  layer: 'above' | 'below';
  pages: 'all' | 'custom';
  pageRange?: string;
}

export interface PageNumberOptions {
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  format: 'number' | 'page_n' | 'page_n_of_m' | 'n_of_m';
  startNumber: number;
  fontSize: number;
  color: string;
  margin: number;
  pages: 'all' | 'exclude-first' | 'custom';
  customRange?: string;
}

export interface SignAnnotation {
  id: string;
  type: 'draw' | 'type' | 'stamp' | 'upload' | 'date' | 'initial';
  dataUrl: string;
  pageNumber: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage
  height: number; // percentage
  label?: string;
}

export interface EditAnnotation {
  id: string;
  type: 'text' | 'draw' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'image';
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  opacity?: number;
  path?: { x: number; y: number }[];
  imageUrl?: string;
}

export interface MetadataOptions {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}

export interface WorkflowFile {
  blob: Blob;
  name: string;
  size: number;
  pageCount?: number;
  fromTool: string;
  timestamp: number;
}

export interface PdfPageMeta {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  widthMm: number;
  heightMm: number;
  format: string;
  orientation: 'portrait' | 'landscape' | 'square';
}

export interface PdfVerificationResult {
  isValid: boolean;
  isEncrypted: boolean;
  pageCount: number;
  fileSizeBytes: number;
  fileName: string;
  pdfVersion?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  pages: PdfPageMeta[];
  integrityIssues: string[];
}
