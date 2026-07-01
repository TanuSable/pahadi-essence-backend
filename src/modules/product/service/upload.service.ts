import { Readable } from 'stream';
import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '@shared/config/cloudinary';
import { CLOUDINARY_FOLDERS, HTTP_STATUS } from '@shared/constants';
import { logger } from '@shared/logger/logger';
import { AppError } from '@shared/utils/app-error';

const uploadBuffer = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video',
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const uploadService = {
  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploads = files.map(async (file) => {
      const result = await uploadBuffer(file.buffer, CLOUDINARY_FOLDERS.PRODUCT_IMAGES, 'image');
      return result.secure_url;
    });

    return Promise.all(uploads);
  },

  async uploadVideos(files: Express.Multer.File[]): Promise<string[]> {
    const uploads = files.map(async (file) => {
      const result = await uploadBuffer(file.buffer, CLOUDINARY_FOLDERS.PRODUCT_VIDEOS, 'video');
      return result.secure_url;
    });

    return Promise.all(uploads);
  },

  async deleteMedia(urls: string[]): Promise<void> {
    const deletions = urls.map(async (url) => {
      try {
        const publicId = this.extractPublicId(url);
        if (!publicId) return;

        const isVideo = url.includes('/video/');
        await cloudinary.uploader.destroy(publicId, {
          resource_type: isVideo ? 'video' : 'image',
        });
      } catch (error) {
        logger.warn({ err: error, url }, 'Failed to delete Cloudinary asset');
      }
    });

    await Promise.all(deletions);
  },

  extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;

      const pathAfterUpload = parts.slice(uploadIndex + 1);
      const withoutVersion = pathAfterUpload[0]?.startsWith('v') ? pathAfterUpload.slice(1) : pathAfterUpload;
      const publicIdWithExt = withoutVersion.join('/');
      const lastDot = publicIdWithExt.lastIndexOf('.');

      return lastDot === -1 ? publicIdWithExt : publicIdWithExt.slice(0, lastDot);
    } catch {
      return null;
    }
  },

  handleUploadError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        throw new AppError('Uploaded file exceeds size limit', HTTP_STATUS.BAD_REQUEST);
      }
      if (error.message.includes('Only image') || error.message.includes('Only video')) {
        throw new AppError(error.message, HTTP_STATUS.BAD_REQUEST);
      }
    }

    logger.error({ err: error }, 'Cloudinary upload failed');
    throw new AppError('File upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  },
};
