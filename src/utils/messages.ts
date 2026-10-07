import mongoose from "mongoose";
import Project from "@/models/project.model";
import User from "@/models/user.model";
import Task from "@/models/task.model";
import { getCurrentUser } from "@/utils/auth";

type MessageUser = {
    _id: mongoose.Types.ObjectId;
    role: "user" | "admin";
};
  
type MessageProject = {
    client?: mongoose.Types.ObjectId | null;
};
  

export async function getMessageContext(
  projectId: string
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: "Unauthorized",
      status: 401,
      user: null,
      project: null,
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(projectId)
  ) {
    return {
      error: "Invalid project ID",
      status: 400,
      user: currentUser,
      project: null,
    };
  }

  const project = await Project.findById(
    projectId
  ).lean();

  if (!project) {
    return {
      error: "Project not found",
      status: 404,
      user: currentUser,
      project: null,
    };
  }

  const isAdmin =
    currentUser.role === "admin";

  const isClient =
    project.client?.toString() ===
    currentUser._id.toString();

  if (!isAdmin && !isClient) {
    return {
      error: "You do not have access to this project.",
      status: 403,
      user: currentUser,
      project: null,
    };
  }

  return {
    error: null,
    status: 200,
    user: currentUser,
    project,
  };
}


export async function validateMessageTask(
    taskId: string | undefined,
    projectId: string
  ) {
    if (!taskId) {
      return {
        error: null,
        status: 200,
        task: null,
      };
    }
  
    if (
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return {
        error: "Invalid task ID.",
        status: 400,
        task: null,
      };
    }
  
    const task = await Task.findOne({
      _id: taskId,
      project: projectId,
    }).lean();
  
    if (!task) {
      return {
        error:
          "The selected task does not belong to this project.",
        status: 400,
        task: null,
      };
    }
  
    return {
      error: null,
      status: 200,
      task,
    };
  }


  export async function validateMessageRecipient(
    recipientId: string,
    currentUser: MessageUser,
    project: MessageProject
  ) { 
    if (
      !recipientId ||
      !mongoose.Types.ObjectId.isValid(
        recipientId
      )
    ) {
      return {
        error: "Invalid recipient ID.",
        status: 400,
        recipient: null,
      };
    }

    if (
      recipientId ===
      currentUser._id.toString()
    ) {
      return {
        error:
          "You cannot send a message to yourself.",
        status: 400,
        recipient: null,
      };
    }
  
    const recipient = await User.findById(
      recipientId
    )
      .select(
        "_id fname lname email image role"
      )
      .lean();
  
    if (!recipient) {
      return {
        error: "Recipient not found.",
        status: 404,
        recipient: null,
      };
    }
  
    if (currentUser.role === "user") {
      if (recipient.role !== "admin") {
        return {
          error:
            "Clients can only message administrators.",
          status: 403,
          recipient: null,
        };
      }
    }
  
    if (currentUser.role === "admin") {
      const projectClientId =
        project.client?.toString();
  
      if (!projectClientId) {
        return {
          error:
            "This project does not have an assigned client.",
          status: 400,
          recipient: null,
        };
      }
  
      if (recipient.role !== "user") {
        return {
          error:
            "Administrators can only message the client assigned to this project.",
          status: 403,
          recipient: null,
        };
      }
  
      if (
        recipient._id.toString() !==
        projectClientId
      ) {
        return {
          error:
            "You can only message the client assigned to this project.",
          status: 403,
          recipient: null,
        };
      }
    }
  
    return {
      error: null,
      status: 200,
      recipient,
    };
  }