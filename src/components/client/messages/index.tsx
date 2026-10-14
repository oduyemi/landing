"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCheck,
  ChevronRight,
  LoaderCircle,
  MessageCircle,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
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

const getInitials = (fname?: string, lname?: string) => {
  const first = fname?.trim().charAt(0) ?? "";
  const last = lname?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "?";
};

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatConversationTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return formatMessageTime(dateString);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const formatDateDivider = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeConversation = (
  conversation: ApiConversation
): ConversationItem => {
  const participant = conversation.participant;
  const lastMessage = conversation.lastMessage;
  const task = lastMessage.task ?? null;

  return {
    id: `${conversation.project._id}-${conversation.threadId}`,
    threadId: conversation.threadId,
    projectId: conversation.project._id,
    projectName: conversation.project.title,
    projectType: conversation.project.type ?? "Project",
    taskId: task?._id,
    taskTitle: task?.title,
    participant,
    participantRole: participant.role === "admin" ? "Admin" : "Client",
    participantInitials: getInitials(participant.fname, participant.lname),
    lastMessage: lastMessage.content,
    lastMessageTime: formatConversationTime(lastMessage.createdAt),
    unread: conversation.unreadCount > 0,
    unreadCount: conversation.unreadCount,
  };
};

const normalizeMessage = (message: ApiMessage): ChatMessage => {
  const sender = message.sender;

  return {
    id: message._id,
    senderId: sender._id,
    recipientId: message.recipient._id,
    sender: sender.role === "admin" ? "admin" : "client",
    senderName: `${sender.fname} ${sender.lname}`.trim(),
    senderInitials: getInitials(sender.fname, sender.lname),
    content: message.content,
    timestamp: formatMessageTime(message.createdAt),
    read: message.read,
    readAt: message.readAt,
    taskId: message.task?._id,
    taskTitle: message.task?.title,
    replyTo: message.replyTo
      ? {
          id: message.replyTo._id,
          senderName: `${message.replyTo.sender.fname} ${message.replyTo.sender.lname}`.trim(),
          content: message.replyTo.content,
          createdAt: message.replyTo.createdAt,
        }
      : null,
  };
};

export const MessagesDashboard = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ) ?? null,
    [conversations, selectedConversationId]
  );

  const unreadCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0
      ),
    [conversations]
  );

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to authenticate.");
      }

      const data = await response.json();
      setCurrentUser(data.user ?? null);
    } catch (error) {
      console.error("FETCH CURRENT USER ERROR:", error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError(null);

      const response = await fetch("/api/messages/conversations", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load conversations.");
      }

      const normalized: ConversationItem[] = (
        data.conversations ?? []
      ).map(normalizeConversation);

      setConversations(normalized);

      setSelectedConversationId((current) => {
        if (
          current &&
          normalized.some((conversation) => conversation.id === current)
        ) {
          return current;
        }

        return normalized[0]?.id ?? null;
      });
    } catch (error) {
      console.error("FETCH CONVERSATIONS ERROR:", error);

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

      if (!message?.project?._id || !message?.threadId) return;

      setSelectedConversationId(
        `${message.project._id}-${message.threadId}`
      );
      setShowSidebar(false);
    },
    [fetchConversations]
  );

  const fetchMessages = useCallback(
    async (conversation: ConversationItem) => {
      try {
        setLoadingMessages(true);
        setMessageError(null);

        const params = new URLSearchParams({
          projectId: conversation.projectId,
          threadId: conversation.threadId,
          limit: "100",
        });

        const response = await fetch(
          `/api/messages/thread?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load messages.");
        }

        const normalized: ChatMessage[] = (data.messages ?? [])
          .map(normalizeMessage)
          .reverse();

        setMessages(normalized);

        const hasUnread = normalized.some(
          (message) =>
            message.recipientId === currentUser?._id && !message.read
        );

        if (hasUnread) {
          const readResponse = await fetch(
            `/api/messages/thread/${encodeURIComponent(
              conversation.threadId
            )}/read`,
            {
              method: "PATCH",
              credentials: "include",
            }
          );

          if (readResponse.ok) {
            setConversations((previous) =>
              previous.map((item) =>
                item.id === conversation.id
                  ? { ...item, unread: false, unreadCount: 0 }
                  : item
              )
            );
          }
        }
      } catch (error) {
        console.error("FETCH THREAD MESSAGES ERROR:", error);

        setMessages([]);
        setMessageError(
          error instanceof Error
            ? error.message
            : "Unable to load this conversation."
        );
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUser?._id]
  );

  useEffect(() => {
    void fetchCurrentUser();
    void fetchConversations();
  }, [fetchCurrentUser, fetchConversations]);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setMessageError(null);
      return;
    }

    void fetchMessages(selectedConversation);
  }, [selectedConversation, fetchMessages]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
    setShowSidebar(false);
  }, []);

  const handleSendMessage = useCallback(
    async (content: string, replyTo?: string) => {
      if (!selectedConversation || !content.trim()) return false;

      try {
        setMessageError(null);

        const response = await fetch("/api/messages", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: selectedConversation.projectId,
            recipientId: selectedConversation.participant._id,
            content: content.trim(),
            threadId: selectedConversation.threadId,
            taskId: selectedConversation.taskId,
            replyTo: replyTo || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to send message.");
        }

        if (data.message) {
          const normalized = normalizeMessage(data.message);

          setMessages((previous) => [...previous, normalized]);
        }

        await fetchConversations();
        return true;
      } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);

        setMessageError(
          error instanceof Error
            ? error.message
            : "Unable to send your message."
        );

        throw error;
      }
    },
    [selectedConversation, fetchConversations]
  );

  if (loadingConversations) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-6 animate-pulse">
            <div className="h-3 w-20 rounded bg-[#e3e8f0]" />
            <div className="mt-4 h-8 w-48 rounded-lg bg-[#e3e8f0]" />
            <div className="mt-3 h-4 w-72 max-w-full rounded bg-[#e9edf3]" />
          </div>

          <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-[#e3e8f0] bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="hidden border-r border-[#e8ecf2] p-5 lg:block">
              <div className="h-11 animate-pulse rounded-xl bg-[#f0f3f7]" />
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="mt-5 flex animate-pulse gap-3"
                >
                  <div className="h-11 w-11 rounded-full bg-[#e9edf3]" />
                  <div className="flex-1 pt-1">
                    <div className="h-3 w-2/3 rounded bg-[#e9edf3]" />
                    <div className="mt-3 h-3 w-full rounded bg-[#f0f3f7]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex min-h-[500px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2fa] text-[#28456f]">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                </div>
                <p className="mt-4 text-sm font-medium text-[#35435a]">
                  Preparing your inbox
                </p>
                <p className="mt-1 text-xs text-[#8994a6]">
                  Loading your project conversations...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[520px] max-w-[1600px] items-center justify-center rounded-2xl border border-[#e3e8f0] bg-white p-6 shadow-sm">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0ee] text-[#b9382b]">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-[#202d42]">
              We couldn&apos;t load your inbox
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#778297]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void fetchConversations()}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172b4d] px-5 text-sm font-semibold text-white transition hover:bg-[#223c65]"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <PageHeading
            unreadCount={0}
            conversationCount={0}
          />

          <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-[#e3e8f0] bg-white px-6 py-12 text-center shadow-sm">
            <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[24px] bg-[#edf2fa] text-[#28456f]">
              <MessageSquareText className="h-8 w-8" />
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-[#dce8f9]">
                <PlusIcon />
              </span>
            </div>

            <h2 className="mt-6 text-xl font-semibold tracking-[-0.035em] text-[#202d42]">
              Your inbox starts here
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#778297]">
              Connect with your project team to discuss progress, ask
              questions, and keep important decisions in one place.
            </p>

            <div className="mt-6">
              <StartMessaging onStarted={handleMessageStarted} />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#8994a6]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Project-focused conversations
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Direct team communication
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <PageHeading
          unreadCount={unreadCount}
          conversationCount={conversations.length}
        />

        <div className="mt-6 grid min-h-[600px] overflow-hidden rounded-2xl border border-[#e1e6ee] bg-white shadow-[0_5px_25px_rgba(23,43,77,0.045)] lg:min-h-[calc(100vh-260px)] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
          <aside
            className={`min-h-[560px] min-w-0 border-r border-[#e8ecf2] bg-white ${
              showSidebar ? "block" : "hidden"
            } lg:block`}
          >
            <div className="flex items-center justify-between border-b border-[#edf0f4] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#253249]">
                  Conversations
                </h2>
                <p className="mt-1 text-xs text-[#8994a6]">
                  Your project discussions
                </p>
              </div>

              <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#edf2fa] px-2 text-xs font-semibold tabular-nums text-[#28456f]">
                {conversations.length}
              </span>
            </div>

            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId ?? ""}
              onSelect={(conversation) =>
                handleSelectConversation(conversation.id)
              }
              onMessageStarted={handleMessageStarted}
            />
          </aside>

          <main
            className={`min-h-[560px] min-w-0 bg-white ${
              showSidebar ? "hidden" : "block"
            } lg:block`}
          >
            {selectedConversation ? (
              <div className="flex h-full min-h-[560px] min-w-0 flex-col">
                <div className="flex items-center gap-2 border-b border-[#edf0f4] px-3 py-2 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowSidebar(true)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-[#536176] transition hover:bg-[#f1f4f8]"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Inbox
                  </button>
                </div>

                {messageError && (
                  <div
                    role="alert"
                    className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-[#f0d0cc] bg-[#fff7f6] p-3 text-sm text-[#a52b20] sm:mx-6"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="flex-1">{messageError}</span>
                    <button
                      type="button"
                      onClick={() => setMessageError(null)}
                      aria-label="Dismiss error"
                      className="shrink-0 opacity-70 hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="min-h-0 flex-1">
                  <Conversation
                    conversation={selectedConversation}
                    messages={messages}
                    loading={loadingMessages}
                    currentUserId={currentUser?._id}
                    onSendMessage={handleSendMessage}
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2fa] text-[#28456f]">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-base font-semibold text-[#29364c]">
                  Select a conversation
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[#8792a5]">
                  Choose a conversation to view messages and continue the
                  discussion.
                </p>
              </div>
            )}
          </main>
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#8994a6]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your project conversations in one place
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCheck className="h-3.5 w-3.5" />
            {unreadCount > 0
              ? `${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`
              : "You’re all caught up"}
          </span>
        </footer>
      </div>
    </div>
  );
};

function PageHeading({
  unreadCount,
  conversationCount,
}: {
  unreadCount: number;
  conversationCount: number;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#8792a5]">
          <span>Workspace</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#35435a]">Messages</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-[-0.045em] text-[#172033] sm:text-3xl">
            Messages
          </h1>

          {unreadCount > 0 && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#d8e5f7] bg-[#edf4ff] px-3 text-xs font-semibold text-[#315b92]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4778b9]" />
              {unreadCount} unread
            </span>
          )}
        </div>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#778297]">
          Stay connected with your project team and keep every discussion
          organized.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start rounded-xl border border-[#e3e8f0] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(20,35,60,0.025)] sm:self-auto">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2fa] text-[#28456f]">
          <MessageSquareText className="h-[18px] w-[18px]" />
        </div>

        <div>
          <p className="text-lg font-semibold leading-5 tabular-nums text-[#202d42]">
            {conversationCount}
          </p>
          <p className="mt-1 text-[11px] text-[#8994a6]">
            Active conversations
          </p>
        </div>
      </div>
    </header>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="h-3 w-3 text-[#28456f]"
    >
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
