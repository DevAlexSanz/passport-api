import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '@config/config';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
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
