import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

import {
  GallerySection,
} from "@/types/gallery";

cloudinary.config({
  cloud_name:
    process.env
      .CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env
      .CLOUDINARY_API_KEY,

  api_secret:
    process.env
      .CLOUDINARY_API_SECRET,
});

export const GALLERY_FOLDER_PATHS =
  {
    churchlife:
      "gcc/gallery/churchlife",

    youth:
      "gcc/gallery/youth",

    communityPrograms:
      "gcc/gallery/community",

    missions:
      "gcc/gallery/missions",
  } as const;

export async function getGalleryImages(
  path?: string
) {
  try {
    const expression = path
      ? `folder:${path}`
      : "folder:gcc/gallery/*";

    const response =
      await cloudinary.search
        .expression(expression)
        .sort_by(
          "created_at",
          "desc"
        )
        .max_results(500)
        .execute();

    return (
      response.resources || []
    ).map((image: any) => ({
      id:
        image.public_id,

      name:
        image.display_name ||
        image.original_filename ||
        image.public_id
          .split("/")
          .pop(),

      url:
        image.secure_url,

      format:
        image.format,

      createdAt:
        image.created_at,
    }));
  } catch (error: any) {
    console.error(
      "Cloudinary gallery fetch error:",
      error?.message
    );

    return [];
  }
}

export async function getGalleryImageCount() {
  try {
    const response = await cloudinary.search
      .expression("public_id:gcc/gallery/*")
      .max_results(1)
      .execute();

    return response.total_count ?? 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
}



export async function getGallerySubfolders(
  section: GallerySection
) {
  try {
    const rootPath =
      GALLERY_FOLDER_PATHS[
        section
      ];

    const result =
      await cloudinary.api.sub_folders(
        rootPath
      );

    const folders =
      result.folders || [];

    const populatedFolders =
      await Promise.all(
        folders.map(
          async (
            folder: any
          ) => {
            try {
              const search =
                await cloudinary.search
                  .expression(
                    `folder:${folder.path}`
                  )
                  .max_results(
                    1
                  )
                  .execute();

              const count =
                search.resources
                  ?.length || 0;

              if (
                count === 0
              ) {
                return null;
              }

              return {
                name:
                  folder.name,

                path:
                  folder.path,

                count,
              };
            // } catch {
            //   return null;
            // }
            } catch (error) {
              console.error(
                "Folder failed:",
                folder.path,
                error
              );
            
              return null;
            }
          }
        )
      );

    return populatedFolders.filter(
      Boolean
    );
  } catch (error) {
    console.error(
      "Cloudinary subfolder fetch error:",
      error
    );

    return [];
  }
}

export async function uploadGalleryImage(
  fileBuffer: Buffer,
  section: GallerySection,
  subfolder: string
): Promise<{
  url: string;
  public_id: string;
}> {
  const folder =
    `${GALLERY_FOLDER_PATHS[section]}/${subfolder}`;

  return new Promise(
    (resolve, reject) => {
      const stream =
        cloudinary.uploader.upload_stream(
          {
            folder,

            resource_type:
              "image",

            overwrite: false,

            invalidate: true,

            transformation:
              [
                {
                  width:
                    1500,

                  crop:
                    "limit",
                },

                {
                  quality:
                    "auto",
                },

                {
                  fetch_format:
                    "auto",
                },
              ],
          },
          (
            error,
            result
          ) => {
            if (error)
              return reject(
                error
              );

            if (!result) {
              return reject(
                new Error(
                  "Upload failed"
                )
              );
            }

            resolve({
              url:
                result.secure_url,

              public_id:
                result.public_id,
            });
          }
        );

      streamifier
        .createReadStream(
          fileBuffer
        )
        .pipe(stream);
    }
  );
}

export async function getFolderContents(
  path: string
) {
  try {
    const response =
      await cloudinary.search
        .expression(
          `folder:${path}`
        )
        .sort_by(
          "created_at",
          "desc"
        )
        .max_results(500)
        .execute();

    return (
      response.resources || []
    ).map((file: any) => ({
      id:
        file.public_id,

      name:
        file.display_name ||
        file.original_filename ||
        file.public_id
          .split("/")
          .pop(),

      url:
        file.secure_url,

      format:
        file.format,

      createdAt:
        file.created_at,
    }));
  } catch (error: any) {
    console.error(
      "Cloudinary folder fetch error:",
      {
        path,

        message:
          error?.message,
      }
    );

    return [];
  }
}

export async function deleteGalleryImage(
  publicId: string
): Promise<boolean> {
  try {
    const result =
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type:
            "image",
        }
      );

    return (
      result.result ===
        "ok" ||
      result.result ===
        "not found"
    );
  } catch (error: any) {
    console.error(
      "Cloudinary delete error:",
      {
        publicId,

        message:
          error?.message,
      }
    );

    return false;
  }
}

export async function deleteGalleryImages(
  publicIds: string[]
): Promise<boolean> {
  try {
    await cloudinary.api.delete_resources(
      publicIds,
      {
        resource_type:
          "image",
      }
    );

    return true;
  } catch (error: any) {
    console.error(
      "Cloudinary bulk delete error:",
      {
        publicIds,

        message:
          error?.message,
      }
    );

    return false;
  }
}

export async function uploadHeroSlideImage(
  fileBuffer: Buffer,
  publicId?: string
): Promise<{
  url: string;
  public_id: string;
}> {
  return new Promise(
    (resolve, reject) => {
      const stream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              "gcc/carousel",

            resource_type:
              "image",

            overwrite: true,

            invalidate: true,

            public_id:
              publicId,

            transformation:
              [
                {
                  width:
                    1600,

                  crop:
                    "limit",
                },

                {
                  quality:
                    "auto",
                },

                {
                  fetch_format:
                    "auto",
                },
              ],
          },
          (
            error,
            result
          ) => {
            if (error)
              return reject(
                error
              );

            if (!result) {
              return reject(
                new Error(
                  "Upload failed"
                )
              );
            }

            resolve({
              url:
                result.secure_url,

              public_id:
                result.public_id,
            });
          }
        );

      streamifier
        .createReadStream(
          fileBuffer
        )
        .pipe(stream);
    }
  );
}


export async function uploadMeetingImage(
  fileBuffer: Buffer,
  publicId?: string
): Promise<{
  url: string;
  public_id: string;
}> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "gcc/events",

        resource_type: "image",

        overwrite: true,

        invalidate: true,

        public_id: publicId,

        transformation: [
          {
            width: 1600,
            crop: "limit",
          },
          {
            quality: "auto",
          },
          {
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(
            new Error("Upload failed")
          );
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier
      .createReadStream(fileBuffer)
      .pipe(stream);
  });
}