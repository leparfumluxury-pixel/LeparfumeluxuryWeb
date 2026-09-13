import { v2 as cloudinary } from "cloudinary";
import { writeAsyncIterableToWritable } from "@react-router/node";

let configured = false;

function ensureCloudinaryConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
}

export async function uploadImage(
  data: AsyncIterable<Uint8Array>,
  folder: string = "maison-noir",
): Promise<string> {
  ensureCloudinaryConfigured();

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );
    writeAsyncIterableToWritable(data, uploadStream);
  });
}

export { cloudinary };
