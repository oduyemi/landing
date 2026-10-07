"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConversationList } from "./ConversationList";
import { Conversation } from "./Conversation";
import { StartMessaging } from "./StartMessaging";


export interface CurrentUser {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  image?: string | null;
  role: "user" | "admin";
}


export interface ConversationParticipant {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  image?: string | null;
  role: "user" | "admin";
}

export interface ConversationProject {
  _id: string;
  title: string;
  type?: string;
}

export interface ConversationTask {
  _id: string;
  title: string;
  status?: string;
  priority?: string;
}

export interface ConversationItem {
  id: string;
  threadId: string;

  projectId: string;
  projectName: string;
  projectType: string;

  taskId?: string;
  taskTitle?: string;

  participant: ConversationParticipant;
  participantRole: "Admin" | "Client";
  participantInitials: string;

  lastMessage: string;
  lastMessageTime: string;
  unread?: boolean;

  unreadCount: number;
}

export interface ChatMessage {
  id: string;

  senderId: string;
  recipientId: string;

  sender: "client" | "admin";
  senderName: string;
  senderInitials: string;

  content: string;
  timestamp: string;

  read: boolean;
  readAt?: string | null;

  taskId?: string;
  taskTitle?: string;

  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    createdAt?: string;
  } | null;
}

interface ApiConversation {
  threadId: string;

  project: ConversationProject;

  participant: ConversationParticipant;

  lastMessage: {
    _id: string;
    content: string;
    createdAt: string;
    sender: ConversationParticipant;
    recipient: ConversationParticipant;
    task?: ConversationTask | null;
  };

  unreadCount: number;
}

export interface ApiMessage {
  _id: string;

  project: {
    _id: string;
    title: string;
    type?: string;
  };

  task?: {
    _id: string;
    title: string;
    status?: string;
    priority?: string;
  } | null;

  sender: ConversationParticipant;
  recipient: ConversationParticipant;

  content: string;

  threadId: string;

  read: boolean;
  readAt?: string | null;

  createdAt: string;

  replyTo?: {
    _id: string;
    sender: ConversationParticipant;
    content: string;
    createdAt: string;
  } | null;
}

const getInitials = (
  fname?: string,
  lname?: string
) => {
  const first = fname?.trim().charAt(0) ?? "";
  const last = lname?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "?";
};

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatConversationTime = (
  dateString: string
) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const formatDateDivider = (
  dateString: string
) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeConversation = (
  conversation: ApiConversation
): ConversationItem => {
  const participant =
    conversation.participant;

  const lastMessage =
    conversation.lastMessage;

  const task =
    lastMessage.task ?? null;

  return {
    id: `${conversation.project._id}-${conversation.threadId}`,

    threadId:
      conversation.threadId,

    projectId:
      conversation.project._id,

    projectName:
      conversation.project.title,

    projectType:
      conversation.project.type ??
      "Project",

    taskId:
      task?._id,

    taskTitle:
      task?.title,

    participant,

    participantRole:
      participant.role === "admin"
        ? "Admin"
        : "Client",

    participantInitials:
      getInitials(
        participant.fname,
        participant.lname
      ),

    lastMessage:
      lastMessage.content,

    lastMessageTime:
      formatConversationTime(
        lastMessage.createdAt
      ),

    unread:
      conversation.unreadCount > 0,

    unreadCount:
      conversation.unreadCount,
  };
};

const normalizeMessage = (
  message: ApiMessage
): ChatMessage => {
  const sender = message.sender;

  return {
    id: message._id,

    senderId:
      sender._id,

    recipientId:
      message.recipient._id,

    sender:
      sender.role === "admin"
        ? "admin"
        : "client",

    senderName:
      `${sender.fname} ${sender.lname}`.trim(),

    senderInitials:
      getInitials(
        sender.fname,
        sender.lname
      ),

    content:
      message.content,

    timestamp:
      formatMessageTime(
        message.createdAt
      ),

    read:
      message.read,

    readAt:
      message.readAt,

    taskId:
      message.task?._id,

    taskTitle:
      message.task?.title,

    replyTo:
      message.replyTo
        ? {
            id:
              message.replyTo._id,

            senderName:
              `${message.replyTo.sender.fname} ${message.replyTo.sender.lname}`.trim(),

            content:
              message.replyTo.content,

            createdAt:
              message.replyTo.createdAt,
          }
        : null,
  };
};

export const MessagesDashboard = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedConversation =
    useMemo(
      () =>
        conversations.find(
          (conversation) =>
            conversation.id ===
            selectedConversationId
        ) ?? null,
      [
        conversations,
        selectedConversationId,
      ]
    );

  const fetchCurrentUser =
    useCallback(async () => {
      try {
        const response =
          await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });

        if (!response.ok) {
          throw new Error(
            "Unable to authenticate."
          );
        }

        const data =
          await response.json();

        setCurrentUser(
          data.user ?? null
        );
      } catch (error) {
        console.error(
          "FETCH CURRENT USER ERROR:",
          error
        );
      }
    }, []);

  const fetchConversations =
    useCallback(async () => {
      try {
        setLoadingConversations(true);
        setError(null);

        const response =
          await fetch(
            "/api/messages/conversations",
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load conversations."
          );
        }

        const normalized =
          (
            data.conversations ?? []
          ).map(
            normalizeConversation
          );

        setConversations(
          normalized
        );

        setSelectedConversationId(
          (current) => {
            if (
              current &&
              normalized.some(
                (conversation: ConversationItem) =>
                  conversation.id ===
                  current
              )
            ) {
              return current;
            }

            return normalized[0]?.id ?? null;
          }
        );
      } catch (error) {
        console.error(
          "FETCH CONVERSATIONS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load conversations."
        );
      } finally {
        setLoadingConversations(false);
      }
    }, []);

    const handleMessageStarted = useCallback(
      async (message: ApiMessage) => {
        await fetchConversations();
    
        if (!message?.project?._id || !message?.threadId) {
          return;
        }
    
        setSelectedConversationId(
          `${message.project._id}-${message.threadId}`,
        );
      },
      [fetchConversations],
    );

  const fetchMessages =
    useCallback(async (
      conversation: ConversationItem
    ) => {
      try {
        setLoadingMessages(true);

        const params =
          new URLSearchParams({
            projectId:
              conversation.projectId,

            threadId:
              conversation.threadId,

            limit: "100",
          });

        const response =
          await fetch(
            `/api/messages/thread?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load messages."
          );
        }

        const normalized =
          (
            data.messages ?? []
          )
            .map(
              normalizeMessage
            )
            .reverse();

        setMessages(
          normalized
        );

        const hasUnread =
          normalized.some(
            (message: ChatMessage) =>
              message.recipientId ===
                currentUser?._id &&
              !message.read
          );

        if (hasUnread) {
          await fetch(
            `/api/messages/thread/${encodeURIComponent(
              conversation.threadId
            )}/read`,
            {
              method: "PATCH",
              credentials: "include",
            }
          );

          setConversations(
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  conversation.id
                    ? {
                        ...item,
                        unread: false,
                        unreadCount: 0,
                      }
                    : item
              )
          );
        }
      } catch (error) {
        console.error(
          "FETCH THREAD MESSAGES ERROR:",
          error
        );

        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    }, [currentUser?._id]);

  useEffect(() => {
    void fetchCurrentUser();
    void fetchConversations();
  }, [
    fetchCurrentUser,
    fetchConversations,
  ]);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    void fetchMessages(
      selectedConversation
    );
  }, [
    selectedConversation,
    fetchMessages,
  ]);

  const handleSelectConversation =
    useCallback(
      (id: string) => {
        setSelectedConversationId(
          id
        );
      },
      []
    );

  /**
   * Send a message.
   */
  const handleSendMessage =
    useCallback(
      async (
        content: string,
        replyTo?: string
      ) => {
        if (
          !selectedConversation ||
          !content.trim()
        ) {
          return false;
        }

        try {
          const response =
            await fetch(
              "/api/messages",
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  projectId:
                    selectedConversation.projectId,

                  recipientId:
                    selectedConversation
                      .participant._id,

                  content:
                    content.trim(),

                  threadId:
                    selectedConversation.threadId,

                  taskId:
                    selectedConversation.taskId,

                  replyTo:
                    replyTo || undefined,
                }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Unable to send message."
            );
          }

          if (data.message) {
            const normalized =
              normalizeMessage(
                data.message
              );

            setMessages(
              (previous) => [
                ...previous,
                normalized,
              ]
            );
          }

          await fetchConversations();
          return true;
        } catch (error) {
          console.error(
            "SEND MESSAGE ERROR:",
            error
          );

          throw error;
        }
      },
      [
        selectedConversation,
        fetchConversations,
      ]
    );

  if (loadingConversations) {
    return (
      <section className="h-full min-h-0 w-full bg-[#fafafa]">
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center rounded-lg border border-neutral-200 bg-white">
          <div className="text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border border-neutral-200 border-t-black" />

            <p className="mt-3 text-[8px] text-neutral-400">
              Loading messages...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="h-full min-h-0 w-full bg-[#fafafa]">
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center rounded-lg border border-neutral-200 bg-white">
          <div className="text-center">
            <p className="text-[10px] font-medium text-black">
              Unable to load messages
            </p>

            <p className="mt-1 text-[7px] text-neutral-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void fetchConversations()
              }
              className="mt-4 rounded-[5px] bg-black px-3 py-2 text-[7px] font-medium text-white transition hover:bg-neutral-800"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!conversations.length) {
    return (
      <section className="h-full min-h-0 w-full bg-[#fafafa]">
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center rounded-lg border border-neutral-200 bg-white">
          <div className="flex max-w-[320px] flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
              <span className="text-[12px] font-semibold text-black">
                M
              </span>
            </div>
  
            <p className="mt-4 text-[11px] font-semibold tracking-[-0.01em] text-black">
              Start a conversation
            </p>
  
            <p className="mt-1.5 text-[8px] leading-[1.7] text-neutral-400">
              Have a question about a project, task, or
              deliverable? Start a conversation with your
              project team.
            </p>
  
            <div className="mt-5">
              <StartMessaging
                onStarted={handleMessageStarted}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full min-h-0 w-full bg-[#fafafa]">
      <div className="flex min-h-[calc(100vh-120px)] overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <ConversationList
          conversations={conversations}
          selectedConversationId={
            selectedConversationId ?? ""
          }
          onSelect={(conversation) =>
            handleSelectConversation(conversation.id)
          }
          onMessageStarted={handleMessageStarted}
        />
  
        {selectedConversation && (
          <Conversation
            conversation={selectedConversation}
            messages={messages}
            loading={loadingMessages}
            currentUserId={currentUser?._id}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </section>
  );
};