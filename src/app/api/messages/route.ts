import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

import Message from "@/models/message.model";
import User from "@/models/user.model";

import { dbConnect } from "@/utils/db";
import { getCurrentUser } from "@/utils/auth";
import {
  getMessageContext,
  validateMessageRecipient,
  validateMessageTask,
} from "@/utils/messages";
import { createMessageNotification } from "@/utils/notifications";

import { sendEmailWithRetry } from "@/helper/emailLogic";
import { sendNewMessageMail } from "@/helper/sendNewMessageMail";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
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
        Number.isFinite(parsedLimit)
          ? parsedLimit
          : 50,
        1
      ),
      100
    );

    const query: Record<string, unknown> = {
      $or: [
        {
          sender: currentUser._id,
        },
        {
          recipient: currentUser._id,
        },
      ],
    };

    if (projectId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          projectId
        )
      ) {
        return NextResponse.json(
          {
            error: "Invalid project ID.",
          },
          {
            status: 400,
          }
        );
      }

      query.project =
        new mongoose.Types.ObjectId(projectId);
    }

    if (threadId) {
      query.threadId = threadId.trim();
    }

    if (unread === "true") {
      query.recipient = currentUser._id;
      query.read = false;
    }

    const messages = await Message.find(query)
      .populate(
        "sender",
        "fname lname email image role"
      )
      .populate(
        "recipient",
        "fname lname email image role"
      )
      .populate(
        "project",
        "title"
      )
      .populate(
        "task",
        "title status priority"
      )
      .populate(
        "replyTo",
        "sender content createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load messages.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const {
      projectId,
      recipientId,
      content,
      threadId,
      taskId,
      replyTo,
    }: {
      projectId?: string;
      recipientId?: string;
      content?: string;
      threadId?: string;
      taskId?: string;
      replyTo?: string;
    } = body;

    if (!projectId) {
      return NextResponse.json(
        {
          error: "Project ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!recipientId) {
      return NextResponse.json(
        {
          error: "Recipient ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        projectId
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        recipientId
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid recipient ID.",
        },
        {
          status: 400,
        }
      );
    }

    const messageContent = content?.trim();

    if (!messageContent) {
      return NextResponse.json(
        {
          error: "Message content cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (messageContent.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Message cannot exceed 5000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const projectContext =
      await getMessageContext(projectId);

    if (projectContext.error) {
      return NextResponse.json(
        {
          error: projectContext.error,
        },
        {
          status: projectContext.status,
        }
      );
    }

    const { user, project } =
      projectContext;

    if (!user || !project) {
      return NextResponse.json(
        {
          error:
            "Unable to verify project access.",
        },
        {
          status: 403,
        }
      );
    }

    const recipientResult =
      await validateMessageRecipient(
        recipientId,
        user,
        project
      );

    if (recipientResult.error) {
      return NextResponse.json(
        {
          error: recipientResult.error,
        },
        {
          status: recipientResult.status,
        }
      );
    }

    const taskResult =
      await validateMessageTask(
        taskId,
        projectId
      );

    if (taskResult.error) {
      return NextResponse.json(
        {
          error: taskResult.error,
        },
        {
          status: taskResult.status,
        }
      );
    }

    let resolvedThreadId =
      threadId?.trim();

    if (replyTo) {
      if (
        !mongoose.Types.ObjectId.isValid(
          replyTo
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid reply message ID.",
          },
          {
            status: 400,
          }
        );
      }

      const originalMessage =
        await Message.findOne({
          _id: replyTo,
          project:
            new mongoose.Types.ObjectId(
              projectId
            ),
          $or: [
            {
              sender: user._id,
            },
            {
              recipient: user._id,
            },
          ],
        }).lean();

      if (!originalMessage) {
        return NextResponse.json(
          {
            error:
              "The message you are replying to could not be found.",
          },
          {
            status: 404,
          }
        );
      }

      resolvedThreadId =
        originalMessage.threadId;
    }

    if (!resolvedThreadId) {
      resolvedThreadId = randomUUID();
    }

    const projectObjectId =
      new mongoose.Types.ObjectId(
        projectId
      );

    const recipientObjectId =
      new mongoose.Types.ObjectId(
        recipientId
      );

    const message =
      await Message.create({
        project: projectObjectId,

        task: taskId
          ? new mongoose.Types.ObjectId(
              taskId
            )
          : null,

        threadId:
          resolvedThreadId,

        sender: user._id,

        recipient:
          recipientObjectId,

        content:
          messageContent,

        read: false,

        readAt: null,

        replyTo: replyTo
          ? new mongoose.Types.ObjectId(
              replyTo
            )
          : null,
      });

    const populatedMessage =
      await Message.findById(
        message._id
      )
        .populate(
          "sender",
          "fname lname email image role"
        )
        .populate(
          "recipient",
          "fname lname email image role"
        )
        .populate(
          "project",
          "title"
        )
        .populate(
          "task",
          "title status priority"
        )
        .populate(
          "replyTo",
          "sender content createdAt"
        )
        .lean();

    const actorName =
      `${user.fname ?? ""} ${
        user.lname ?? ""
      }`.trim() || "A user";

    /*
     * Create the in-app notification.
     *
     * This is awaited because it is part of the
     * application's internal notification state.
     */
    try {
      await createMessageNotification({
        recipient:
          recipientObjectId,

        actor: user._id,

        project:
          projectObjectId,

        message:
          message._id,

        projectTitle:
          project.title,

        actorName,

        threadId:
          resolvedThreadId,
      });
    } catch (notificationError) {
      console.error(
        "CREATE MESSAGE NOTIFICATION ERROR:",
        notificationError
      );
    }

    /*
     * Email notification.
     *
     * IMPORTANT:
     * Do not await this operation.
     *
     * Email delivery is secondary to the actual
     * message creation. A slow/unavailable SMTP
     * server must never make POST /api/messages
     * take 60–90 seconds.
     */
    void (async () => {
      try {
        const recipient =
          await User.findById(
            recipientObjectId
          )
            .select(
              "fname lname email"
            )
            .lean();

        if (!recipient?.email) {
          console.warn(
            "MESSAGE EMAIL SKIPPED: Recipient has no email address."
          );

          return;
        }

        const recipientName =
          `${recipient.fname ?? ""} ${
            recipient.lname ?? ""
          }`.trim() || "there";

        const html =
          sendNewMessageMail({
            recipientName,
            senderName:
              actorName,
            projectTitle:
              project.title,
            messagePreview:
              messageContent,
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

    /*
     * Return immediately after the message has
     * been successfully created.
     */
    return NextResponse.json(
      {
        success: true,
        message:
          populatedMessage,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE MESSAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to send message.",
      },
      {
        status: 500,
      }
    );
  }
}