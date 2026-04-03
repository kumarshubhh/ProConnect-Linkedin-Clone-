import dotenv from 'dotenv';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

/** Normalize .env values (Windows CRLF, accidental spaces). */
function envClean(v) {
  if (v == null || typeof v !== 'string') return '';
  return v.replace(/\r/g, '').trim();
}

/**
 * Configure Cloudinary using ONLY explicit vars (never CLOUDINARY_URL + config(true)),
 * because URL parsing can corrupt secrets and cause Invalid Signature.
 */
function configureCloudinary() {
  const cloud_name = envClean(process.env.CLOUDINARY_CLOUD_NAME);
  const api_key = envClean(process.env.CLOUDINARY_API_KEY);
  const api_secret = envClean(process.env.CLOUDINARY_API_SECRET);

  if (!cloud_name || !api_key || !api_secret) {
    console.warn(
      '[Cloudinary] Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET — uploads will fail.'
    );
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
}

configureCloudinary();

export async function uploadBufferToCloudinary(buffer, mimetype, folder = 'proconnect') {
  const cloud_name = envClean(process.env.CLOUDINARY_CLOUD_NAME);
  const api_key = envClean(process.env.CLOUDINARY_API_KEY);
  const api_secret = envClean(process.env.CLOUDINARY_API_SECRET);

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env (do not rely on CLOUDINARY_URL alone).'
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}
