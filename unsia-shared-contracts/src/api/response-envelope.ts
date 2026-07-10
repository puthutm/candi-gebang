export interface MetaEnvelope {
  trace_id: string;
  correlation_id: string;
  timestamp: string;
  api_version: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface SuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta: MetaEnvelope;
}

export interface ErrorEnvelope {
  success: false;
  message: string;
  error: {
    code: string;
    details: any[];
  };
  meta: MetaEnvelope;
}
