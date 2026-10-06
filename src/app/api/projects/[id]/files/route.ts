import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import File, {FileCategory, BrandAssetType} from "@/models/file.model";
import Project from "@/models/project.model";
import { dbConnect } from "@/utils/db";
import {getCurrentUser, requireRole} from "@/utils/auth";
import {uploadToCloudinary} from "@/utils/cloudinary";

const FILE_CATEGORIES: FileCategory[] = [
  "image",
  "brand-asset",
  "deliverable",
];

const BRAND_ASSET_TYPES: BrandAssetType[] = [
  "logo",
  "icon",
  "favicon",
  "other",
];

const FILE_LIMITS: Record<FileCategory, number> = {
    image: 100,
    "brand-asset": 15,
    deliverable: 30,
  };

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

const createSafeFilename = (filename: string) => {
  const extensionIndex = filename.lastIndexOf(".");

  const name =
    extensionIndex > 0
      ? filename.substring(0, extensionIndex)
      : filename;

  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getExtension = (filename: string) => {
  const index = filename.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return filename
    .substring(index + 1)
    .trim()
    .toLowerCase();
};

const getCloudinaryResourceType = (
  category: FileCategory
): "image" | "raw" => {
  if (
    category === "image" ||
    category === "brand-asset"
  ) {
    return "image";
  }

  return "raw";
};

const getCloudinarySubfolder = (
  category: FileCategory
) => {
  switch (category) {
    case "image":
      return "media";

    case "brand-asset":
      return "brand";

    case "deliverable":
      return "others";

    default:
      throw new Error(
        `Unsupported file category: ${category}`
      );
  }
};

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { projectId } = await context.params;
    if (
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await Project.findById(projectId)
      .select("_id title client cloudinaryFolder")
      .lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role !== "admin" &&
      project.client.toString() !==
        currentUser._id.toString()
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const files = await File.find({
      project: projectId,
    })
      .populate(
        "uploadedBy",
        "fname lname email image role"
      )
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      project,
      files,
      count: files.length,
    });
  } catch (error) {
    console.error("GET PROJECT FILES ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  let uploadedPublicId: string | undefined;
  let uploadedResourceType: "image" | "raw" = "image";

  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /*
     * Only administrators can upload files.
     */
    const roleError = requireRole(
      currentUser,
      ["admin"]
    );

    if (roleError) {
      return roleError;
    }

    const { projectId } = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await Project.findById(projectId)
      .select(
        "_id title client cloudinaryFolder"
      )
      .lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!project.cloudinaryFolder) {
      return NextResponse.json(
        {
          error:
            "This project does not have a Cloudinary storage folder.",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const categoryValue = formData.get("category");
    const assetTypeValue = formData.get("assetType");
    const descriptionValue = formData.get("description");

    const orderValue = formData.get("order");
    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "A file is required. Send the file using the 'file' field.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "The uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    if (
      typeof categoryValue !== "string" ||
      !FILE_CATEGORIES.includes(
        categoryValue as FileCategory
      )
    ) {
      return NextResponse.json(
        {
          error: `Invalid file category. Allowed categories: ${FILE_CATEGORIES.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const category = categoryValue as FileCategory;
    const existingFileCount = await File.countDocuments({
        project: project._id,
        category,
      });
      
      const categoryLimit = FILE_LIMITS[category];
      if (existingFileCount >= categoryLimit) {
        const folderName =
          category === "image"
            ? "media"
            : category === "brand-asset"
              ? "brand"
              : "others";
      
        return NextResponse.json(
          {
            error: `The ${folderName} folder has reached its maximum of ${categoryLimit} uploads.`,
            limit: categoryLimit,
            currentCount: existingFileCount,
            category,
          },
          { status: 400 }
        );
      }

    let assetType:
      | BrandAssetType
      | undefined;

    if (category === "brand-asset") {
      if (
        typeof assetTypeValue !== "string" ||
        !BRAND_ASSET_TYPES.includes(
          assetTypeValue as BrandAssetType
        )
      ) {
        return NextResponse.json(
          {
            error: `Brand assets require a valid assetType. Allowed types: ${BRAND_ASSET_TYPES.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }

      assetType =
        assetTypeValue as BrandAssetType;
    }

    let order = 0;
    if (orderValue !== null) {const parsedOrder = Number(orderValue);
    if (
        !Number.isInteger(parsedOrder) ||
        parsedOrder < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Order must be a non-negative integer.",
          },
          { status: 400 }
        );
      }

      order = parsedOrder;
    }

    const description = typeof descriptionValue === "string"
        ? descriptionValue.trim()
        : "";
    const originalName = file.name;
    const extension = getExtension(originalName);
    const safeName = createSafeFilename(originalName);
    const mimeType = file.type || "application/octet-stream";
    const subfolder = getCloudinarySubfolder(category);
    const cloudinaryFolder = `${project.cloudinaryFolder}/${subfolder}`;
    uploadedResourceType = getCloudinaryResourceType(category);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadToCloudinary(buffer,
        {
          folder: cloudinaryFolder,
          publicId: safeName || undefined,
          resourceType:
            uploadedResourceType,
          originalFilename: originalName,
        }
      );

    uploadedPublicId = uploadResult.public_id;
    try {
      const savedFile = await File.create({
        project: project._id,

        name:
          uploadResult.original_filename ||
          safeName ||
          originalName,
        originalName,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        category,
        assetType,
        mimeType,
        extension,
        size: file.size,
        description,
        order,
        uploadedBy: currentUser._id,
      });

      const populatedFile = await File.findById(savedFile._id)
          .populate(
            "uploadedBy",
            "fname lname email image role"
          )
          .populate(
            "project",
            "title cloudinaryFolder"
          )
          .lean();

      return NextResponse.json(
        {
          message:
            "File uploaded successfully",

          file: populatedFile,
        },
        { status: 201 }
      );
    } catch (databaseError) {
      console.error(
        "SAVE FILE DATABASE ERROR:",
        databaseError
      );

      if (uploadedPublicId) {
        try {
          const { deleteCloudinaryResource } =
            await import(
              "@/utils/cloudinary"
            );

          await deleteCloudinaryResource(
            uploadedPublicId,
            uploadedResourceType
          );
        } catch (cleanupError) {
          console.error(
            "CLOUDINARY FILE CLEANUP ERROR:",
            cleanupError
          );
        }
      }

      throw databaseError;
    }
  } catch (error) {
    console.error(
      "UPLOAD PROJECT FILE ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}