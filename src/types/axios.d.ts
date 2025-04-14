declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
  }

  export interface AxiosError<T = any> {
    config: any;
    code?: string;
    request?: any;
    response?: {
      data: T;
      status: number;
      statusText: string;
      headers: any;
      config: any;
    };
    isAxiosError: boolean;
    toJSON: () => object;
  }

  export interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
  }

  const axios: AxiosInstance;
  export default axios;
} 