export interface JsonResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data?: any;
  errors?: any;
}
