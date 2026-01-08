import { v2 as cloudinary } from 'cloudinary'

/**
 * Initialize Cloudinary with configuration from environment variable
 * Uses CLOUDINARY_URL format: cloudinary://<api_key>:<api_secret>@<cloud_name>
 */
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  })
} else {
  console.warn('CLOUDINARY_URL environment variable is not set. Cloudinary uploads will fail.')
}

export default cloudinary
export { cloudinary }
