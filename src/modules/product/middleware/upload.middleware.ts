import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { UPLOAD_LIMITS } from '@shared/constants';
import { AppError } from '@shared/utils/app-error';
import { HTTP_STATUS } from '@shared/constants';

const storage = multer.memoryStorage();

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image files are allowed'));
};

const videoFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Only video files are allowed'));
};

const imageUpload = multer({
  storage,
  limits: {
    fileSize: UPLOAD_LIMITS.IMAGE_MAX_SIZE_BYTES,
    files: UPLOAD_LIMITS.MAX_IMAGES,
  },
  fileFilter: imageFilter,
});

const videoUpload = multer({
  storage,
  limits: {
    fileSize: UPLOAD_LIMITS.VIDEO_MAX_SIZE_BYTES,
    files: UPLOAD_LIMITS.MAX_VIDEOS,
  },
  fileFilter: videoFilter,
});

const combinedUpload = multer({
  storage,
  limits: {
    fileSize: UPLOAD_LIMITS.VIDEO_MAX_SIZE_BYTES,
    files: UPLOAD_LIMITS.MAX_IMAGES + UPLOAD_LIMITS.MAX_VIDEOS,
  },
}).fields([
  { name: 'images', maxCount: UPLOAD_LIMITS.MAX_IMAGES },
  { name: 'videos', maxCount: UPLOAD_LIMITS.MAX_VIDEOS },
]);

const handleMulterError = (
  uploadMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    uploadMiddleware(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          next(new AppError('Uploaded file exceeds size limit', HTTP_STATUS.BAD_REQUEST));
          return;
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          next(new AppError('Too many files uploaded', HTTP_STATUS.BAD_REQUEST));
          return;
        }
        next(new AppError(error.message, HTTP_STATUS.BAD_REQUEST));
        return;
      }

      if (error instanceof Error) {
        if (error.message.includes('Only image') || error.message.includes('Only video')) {
          next(new AppError(error.message, HTTP_STATUS.BAD_REQUEST));
          return;
        }
      }

      next(error);
    });
  };
};

export const productMediaUpload = handleMulterError(
  combinedUpload as unknown as (req: Request, res: Response, next: NextFunction) => void,
);

export const productImageOnlyUpload = handleMulterError(
  imageUpload.array('images', UPLOAD_LIMITS.MAX_IMAGES) as unknown as (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void,
);

export const productVideoOnlyUpload = handleMulterError(
  videoUpload.array('videos', UPLOAD_LIMITS.MAX_VIDEOS) as unknown as (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void,
);

export const getUploadedFiles = (
  req: Request,
): { images: Express.Multer.File[]; videos: Express.Multer.File[] } => {
  const files = req.files as { images?: Express.Multer.File[]; videos?: Express.Multer.File[] } | undefined;

  return {
    images: files?.images ?? [],
    videos: files?.videos ?? [],
  };
};
