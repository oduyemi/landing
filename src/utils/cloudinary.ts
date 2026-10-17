import {UploadApiResponse, v2 as cloudinary} from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


export const createProjectFolders = async (projectFolder: string) => {
  const root = projectFolder.replace(/^\/+|\/+$/g, "");
  if (!root) {
    throw new Error("A project folder name is required.");
  }

  const folders = [
    root,
    `${root}/media`,
    `${root}/brand`,
    `${root}/others`,
  ];

  for (const folder of folders) {
    await cloudinary.api.create_folder(folder);
  }

  return {
    root,
    media: `${root}/media`,
    brand: `${root}/brand`,
    others: `${root}/others`,
  };
};


export const deleteProjectFolder = async (projectFolder: string) => {
  const root = projectFolder.replace(/^\/+|\/+$/g, "");
  if (!root) {
    throw new Error("A project folder name is required.");
  }

  const resourceTypes: Array<"image" | "video" | "raw"> = [
    "image",
    "video",
    "raw",
  ];

  for (const resourceType of resourceTypes) {
    try {
      await cloudinary.api.delete_resources_by_prefix(root, {
        resource_type: resourceType,
        type: "upload",
        invalidate: true,
      });
    } catch (error) {
      console.error(
        `CLOUDINARY DELETE ${resourceType.toUpperCase()} ERROR:`,
        error
      );

      throw error;
    }
  }

  const folders = [
    `${root}/media`,
    `${root}/brand`,
    `${root}/others`,
    root,
  ];

  for (const folder of folders) {
    try {
      await cloudinary.api.delete_folder(folder);
    } catch (error) {
      console.warn(
        `Could not delete Cloudinary folder "${folder}":`,
        error
      );
    }
  }
};


export const uploadToCloudinary = (
  buffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType: "image" | "raw";
    originalFilename: string;
  }
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType,
        use_filename: !options.publicId,
        unique_filename: !options.publicId,
        overwrite: false,
        filename_override: options.originalFilename,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(
            new Error("Cloudinary returned no upload result.")
          );
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};


export const deleteCloudinaryResource = async (
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image"
) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "upload",
    invalidate: true,
  });
};


export async function uploadProjectImage(
  buffer: Buffer,
  contentType: string
) {
  return new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "portal/projects",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Image upload failed."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
}

export default cloudinary;