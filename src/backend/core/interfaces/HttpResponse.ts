export interface HttpResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      cursor?: string;
      hasNext?: boolean;
    };
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
