export interface JsonResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data?: any;
  records?: any;
  record?: any;
  errors?: any;
}
