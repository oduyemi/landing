import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});



export const createProjectFolders = async (
  projectFolder: string
) => {
  const folders = [
    projectFolder,
    `${projectFolder}/media`,
    `${projectFolder}/brand`,
    `${projectFolder}/others`,
  ];

  for (const folder of folders) {
    await cloudinary.api.create_folder(folder);
  }

  return {
    root: projectFolder,
    media: `${projectFolder}/media`,
    brand: `${projectFolder}/brand`,
    others: `${projectFolder}/others`,
  };
};



export const deleteProjectFolder = async (
  projectFolder: string
) => {
  const resourceTypes: Array<"image" | "video" | "raw"> = [
    "image",
    "video",
    "raw",
  ];

  for (const resourceType of resourceTypes) {
    try {
      await cloudinary.api.delete_resources_by_prefix(
        projectFolder,
        {
          resource_type: resourceType,
          type: "upload",
        }
      );
    } catch (error) {
      console.error(
        `CLOUDINARY DELETE ${resourceType.toUpperCase()} ERROR:`,
        error
      );
    }
  }

  const folders = [
    `${projectFolder}/media`,
    `${projectFolder}/brand`,
    `${projectFolder}/others`,
    projectFolder,
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
        use_filename: true,
        unique_filename: true,
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
            new Error(
              "Cloudinary returned no upload result."
            )
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

export default cloudinary;