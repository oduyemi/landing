import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { randomUUID } from "crypto";
import Message from "@/models/message.model";
import User from "@/models/user.model";
import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import { getMessageContext, validateMessageRecipient, validateMessageTask } from "@/utils/messages";
import { validateMessageAttachments } from "@/utils/message-attachments";
import { createMessageNotification } from "@/utils/notifications";
import { sendEmailWithRetry } from "@/helper/emailLogic";
import { sendNewMessageMail } from "@/helper/sendNewMessageMail";
import { uploadMessageAttachment } from "@/utils/cloudinary";

const MAX_MESSAGE_LENGTH = 5000;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const threadId = searchParams.get("threadId");
    const unread = searchParams.get("unread");
    const limitParam = searchParams.get("limit");
    const parsedLimit = Number(limitParam);
    const limit = Math.min(
      Math.max(
        Number.isFinite(parsedLimit) ? parsedLimit : 50,
        1
      ),
      100
    );

    const query: Record<string, unknown> = {
      $or: [
        { sender: currentUser._id },
        { recipient: currentUser._id },
      ],
    };

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return NextResponse.json(
          { error: "Invalid project ID." },
          { status: 400 }
        );
      }

      query.project = new mongoose.Types.ObjectId(projectId);
    }

    if (threadId) {
      query.threadId = threadId.trim();
    }

    if (unread === "true") {
      query.recipient = currentUser._id;
      query.read = false;
    }

    const messages = await Message.find(query)
      .populate("sender", "fname lname email image role")
      .populate("recipient", "fname lname email image role")
      .populate("project", "title")
      .populate("task", "title status priority")
      .populate("replyTo", "sender content createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });

  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load messages." },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let projectId: string | undefined;
    let recipientId: string | undefined;
    let content: string | undefined;
    let threadId: string | undefined;
    let taskId: string | undefined;
    let replyTo: string | undefined;
    let files: File[] = [];
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      projectId = formData.get("projectId")?.toString();
      recipientId = formData.get("recipientId")?.toString();
      content = formData.get("content")?.toString();
      threadId = formData.get("threadId")?.toString();
      taskId = formData.get("taskId")?.toString();
      replyTo = formData.get("replyTo")?.toString();

      files = formData
        .getAll("attachments")
        .filter(
          (item): item is File => item instanceof File
        );

    } else {
      const body = await req.json();
      projectId = body.projectId;
      recipientId = body.recipientId;
      content = body.content;
      threadId = body.threadId;
      taskId = body.taskId;
      replyTo = body.replyTo;
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
      );
    }

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required." },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID." },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json(
        { error: "Invalid recipient ID." },
        { status: 400 }
      );
    }

    const messageContent = content?.trim() ?? "";
    if (!messageContent && files.length === 0) {
      return NextResponse.json(
        {
          error: "Please enter a message or attach a file.",
        },
        { status: 400 }
      );
    }

    if (messageContent.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    const attachmentError = validateMessageAttachments(files);
    if (attachmentError) {
      return NextResponse.json(
        { error: attachmentError },
        { status: 400 }
      );
    }

    const projectContext = await getMessageContext(projectId);
    if (projectContext.error) {
      return NextResponse.json(
        { error: projectContext.error },
        { status: projectContext.status }
      );
    }

    const { user, project } = projectContext;

    if (!user || !project) {
      return NextResponse.json(
        { error: "Unable to verify project access." },
        { status: 403 }
      );
    }

    // ==========================================
    // VALIDATE RECIPIENT
    // ==========================================

    const recipientResult = await validateMessageRecipient(
      recipientId,
      user,
      project
    );

    if (recipientResult.error) {
      return NextResponse.json(
        { error: recipientResult.error },
        { status: recipientResult.status }
      );
    }

    // ==========================================
    // VALIDATE TASK
    // ==========================================

    const taskResult = await validateMessageTask(
      taskId,
      projectId
    );

    if (taskResult.error) {
      return NextResponse.json(
        { error: taskResult.error },
        { status: taskResult.status }
      );
    }

    // ==========================================
    // HANDLE MESSAGE THREADS / REPLIES
    // ==========================================

    let resolvedThreadId = threadId?.trim();

    if (replyTo) {
      if (!mongoose.Types.ObjectId.isValid(replyTo)) {
        return NextResponse.json(
          { error: "Invalid reply message ID." },
          { status: 400 }
        );
      }

      const originalMessage = await Message.findOne({
        _id: replyTo,
        project: new mongoose.Types.ObjectId(projectId),
        $or: [
          { sender: user._id },
          { recipient: user._id },
        ],
      }).lean();

      if (!originalMessage) {
        return NextResponse.json(
          {
            error: "The message you are replying to could not be found.",
          },
          { status: 404 }
        );
      }

      resolvedThreadId = originalMessage.threadId;
    }

    if (!resolvedThreadId) {
      resolvedThreadId = randomUUID();
    }

    // ==========================================
    // PREPARE OBJECT IDS
    // ==========================================

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const recipientObjectId = new mongoose.Types.ObjectId(
      recipientId
    );

    const taskObjectId = taskId
      ? new mongoose.Types.ObjectId(taskId)
      : null;

    const replyToObjectId = replyTo
      ? new mongoose.Types.ObjectId(replyTo)
      : null;

    // ==========================================
    // UPLOAD ATTACHMENTS
    // ==========================================

    const uploadedAttachments = [];

    for (const file of files) {
      const buffer = Buffer.from(
        await file.arrayBuffer()
      );

      const uploadedAttachment = await uploadMessageAttachment(
        buffer,
        {
          userId: user._id.toString(),
          originalFilename: file.name,
          mimeType: file.type,
        }
      );

      uploadedAttachments.push({
        url: uploadedAttachment.url,
        publicId: uploadedAttachment.publicId,
        name: file.name,
        type: file.type,
        size: file.size,
        resourceType: uploadedAttachment.resourceType,
      });
    }

    // ==========================================
    // CREATE MESSAGE
    // ==========================================

    const message = await Message.create({
      project: projectObjectId,
      task: taskObjectId,
      threadId: resolvedThreadId,
      sender: user._id,
      recipient: recipientObjectId,
      content: messageContent,

      attachments:
        uploadedAttachments.length > 0
          ? uploadedAttachments
          : undefined,

      read: false,
      readAt: null,
      replyTo: replyToObjectId,
    });

    // ==========================================
    // POPULATE MESSAGE
    // ==========================================

    const populatedMessage = await Message.findById(
      message._id
    )
      .populate("sender", "fname lname email image role")
      .populate("recipient", "fname lname email image role")
      .populate("project", "title")
      .populate("task", "title status priority")
      .populate("replyTo", "sender content createdAt")
      .lean();

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================

    const actorName =
      `${user.fname ?? ""} ${user.lname ?? ""}`.trim() ||
      "A user";

    try {
      await createMessageNotification({
        recipient: recipientObjectId,
        actor: user._id,
        project: projectObjectId,
        message: message._id,
        projectTitle: project.title,
        actorName,
        threadId: resolvedThreadId,
      });

    } catch (notificationError) {
      console.error(
        "CREATE MESSAGE NOTIFICATION ERROR:",
        notificationError
      );
    }

    // ==========================================
    // SEND EMAIL NOTIFICATION
    // ==========================================

    void (async () => {
      try {
        const recipient = await User.findById(
          recipientObjectId
        )
          .select("fname lname email")
          .lean();

        if (!recipient?.email) {
          console.warn(
            "MESSAGE EMAIL SKIPPED: Recipient has no email address."
          );

          return;
        }

        const recipientName =
          `${recipient.fname ?? ""} ${recipient.lname ?? ""}`.trim() ||
          "there";

        const messagePreview =
          messageContent ||
          (
            uploadedAttachments.length > 0
              ? `Sent ${uploadedAttachments.length} attachment(s).`
              : "Sent a message."
          );

        const html = sendNewMessageMail({
          recipientName,
          senderName: actorName,
          projectTitle: project.title,
          messagePreview,
        });

        await sendEmailWithRetry(
          recipient.email,
          `New message from ${actorName}`,
          html
        );

      } catch (emailError) {
        console.error(
          "SEND MESSAGE EMAIL ERROR:",
          emailError
        );
      }
    })();

    // ==========================================
    // RETURN RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message: populatedMessage,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("CREATE MESSAGE ERROR:", error);

    return NextResponse.json(
      { error: "Unable to send message." },
      { status: 500 }
    );
  }
}
