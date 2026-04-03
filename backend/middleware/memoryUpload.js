import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadMemory = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12 MB
});
