
export const MAX_MESSAGE_ATTACHMENTS = 8;

export const MAX_MESSAGE_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MESSAGE_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
] as const;

export function validateMessageAttachments(files: File[]) {
  if (files.length > MAX_MESSAGE_ATTACHMENTS) {
    return `You can attach a maximum of ${MAX_MESSAGE_ATTACHMENTS} files per message.`;
  }

  for (const file of files) {
    if (file.size <= 0) {
      return `${file.name} is empty.`;
    }

    if (file.size > MAX_MESSAGE_ATTACHMENT_SIZE) {
      return `${file.name} exceeds the 10 MB file size limit.`;
    }

    if (
      !ALLOWED_MESSAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MESSAGE_MIME_TYPES)[number]
      )
    ) {
      return `${file.name} is not a supported file type.`;
    }
  }

  return null;
}
