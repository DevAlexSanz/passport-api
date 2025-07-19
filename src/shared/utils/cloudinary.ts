import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '@config/config';

const { CLOUD_NAME, API_KEY, API_SECRET } = env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          return reject(
            new Error(
              error?.message ||
                'No se pudo cargar la imagen. Inténtalo más tarde.'
            )
          );
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};
