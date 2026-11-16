
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Plus,
  ArrowUpRight,
  Inbox,
} from "lucide-react";

import { ConversationList } from "./ConversationList";
import { Conversation } from "./Conversation";
import { StartMessaging } from "./StartMessaging";

// ======================================================
// TYPES
// ======================================================

export interface CurrentUser {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  image?: string | null;
  role: "user" | "admin";
}

export interface ChatAttachment {
  url: string;
  publicId: string;
  name: string;
  type: string;
  size: number;
  resourceType: "image" | "raw";
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
  attachments?: ChatAttachment[];
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
    attachments?: ChatAttachment[];
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
  attachments?: ChatAttachment[];
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

// ======================================================
// HELPERS
// ======================================================

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
    participantRole:
      participant.role === "admin" ? "Admin" : "Client",
    participantInitials: getInitials(
      participant.fname,
      participant.lname
    ),
    lastMessage:
      lastMessage.content?.trim() ||
      (lastMessage.attachments?.length
        ? `📎 ${lastMessage.attachments.length} attachment${
            lastMessage.attachments.length === 1 ? "" : "s"
          }`
        : "No message content"),
    lastMessageTime: formatConversationTime(
      lastMessage.createdAt
    ),
    unread: conversation.unreadCount > 0,
    unreadCount: conversation.unreadCount,
  };
};

const normalizeMessage = (
  message: ApiMessage
): ChatMessage => {
  const sender = message.sender;

  return {
    id: message._id,
    senderId: sender._id,
    recipientId: message.recipient._id,
    sender: sender.role === "admin" ? "admin" : "client",
    senderName: `${sender.fname} ${sender.lname}`.trim(),
    senderInitials: getInitials(
      sender.fname,
      sender.lname
    ),
    content: message.content ?? "",
    attachments: message.attachments ?? [],
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

// ======================================================
// LOADING SKELETON
// ======================================================

function MessagesSkeleton() {
  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="animate-pulse">
          <div className="h-3 w-24 rounded bg-[#e3e8f0]" />
          <div className="mt-4 h-9 w-52 rounded-lg bg-[#e3e8f0]" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-[#e9edf3]" />
        </div>

        <div className="mt-7 grid min-h-[600px] overflow-hidden rounded-2xl border border-[#e3e8f0] bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="hidden border-r border-[#e8ecf2] p-5 lg:block">
            <div className="h-11 animate-pulse rounded-xl bg-[#f0f3f7]" />

            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="mt-6 flex animate-pulse gap-3"
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2fa] text-[#28456f]">
                <LoaderCircle className="h-6 w-6 animate-spin" />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#253249]">
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

// ======================================================
// ERROR STATE
// ======================================================

function InboxError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[540px] max-w-[1600px] items-center justify-center rounded-2xl border border-[#e3e8f0] bg-white p-6 shadow-sm">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f4dedb] bg-[#fff5f3] text-[#b9382b]">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-lg font-semibold tracking-tight text-[#202d42]">
            We couldn&apos;t load your inbox
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#778297]">
            {error}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172b4d] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#223c65] active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// EMPTY INBOX
// ======================================================

function EmptyInbox({
  onStarted,
}: {
  onStarted: (message: ApiMessage) => Promise<void>;
}) {
  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-3 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <PageHeading unreadCount={0} conversationCount={0} />

        <div className="relative mt-7 flex min-h-[560px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#e3e8f0] bg-white px-6 py-16 text-center shadow-[0_5px_25px_rgba(23,43,77,0.035)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#edf3fc] opacity-70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#f2f5fa] opacity-80 blur-3xl" />

          <div className="relative">
            <div className="relative flex h-[82px] w-[82px] items-center justify-center rounded-[26px] border border-[#e2eaf5] bg-gradient-to-br from-[#f4f7fc] to-[#e9eff9] text-[#28456f] shadow-sm">
              <MessageSquareText className="h-9 w-9" />

              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-[4px] border-white bg-[#28456f] text-white">
                <Plus className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-7">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8190a7]">
                Your workspace
              </span>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-[#202d42] sm:text-3xl">
                Your inbox starts here
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#778297]">
                Connect with your project team to discuss
                progress, share files, ask questions, and
                keep important decisions in one place.
              </p>
            </div>

            <div className="mt-7">
              <StartMessaging onStarted={onStarted} />
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 border-t border-[#edf0f4] pt-7">
              <span className="flex items-center gap-2 text-xs text-[#778297]">
                <ShieldCheck className="h-4 w-4 text-[#536d91]" />
                Project-focused conversations
              </span>

              <span className="flex items-center gap-2 text-xs text-[#778297]">
                <Users className="h-4 w-4 text-[#536d91]" />
                Direct team communication
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// PAGE HEADING
// ======================================================

function PageHeading({
  unreadCount,
  conversationCount,
}: {
  unreadCount: number;
  conversationCount: number;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#8792a5]">
          <span>Workspace</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#35435a]">
            Messages
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-[27px] font-semibold tracking-[-0.055em] text-[#172033] sm:text-[32px]">
            Messages
          </h1>

          {unreadCount > 0 && (
            <span className="inline-flex h-7 items-center gap-2 rounded-full border border-[#d8e5f7] bg-[#edf4ff] px-3 text-[11px] font-semibold text-[#315b92]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4778b9]" />
              {unreadCount} unread
            </span>
          )}
        </div>

        <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#778297]">
          Stay connected with your project team and keep
          every discussion organized.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start rounded-xl border border-[#e3e8f0] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(20,35,60,0.025)] sm:self-auto">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2fa] text-[#28456f]">
          <MessageSquareText className="h-[19px] w-[19px]" />
        </div>

        <div>
          <p className="text-lg font-semibold leading-5 tabular-nums text-[#202d42]">
            {conversationCount}
          </p>

          <p className="mt-1 text-[10px] font-medium text-[#8994a6]">
            Active conversations
          </p>
        </div>

        <div className="ml-2 h-8 w-px bg-[#edf0f4]" />

        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8792a5]">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}

// ======================================================
// MESSAGES DASHBOARD
// ======================================================

export const MessagesDashboard = () => {
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [conversations, setConversations] =
    useState<ConversationItem[]>([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [messageError, setMessageError] =
    useState<string | null>(null);

  const [showSidebar, setShowSidebar] = useState(true);

  // ====================================================
  // DERIVED STATE
  // ====================================================

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id === selectedConversationId
      ) ?? null,
    [conversations, selectedConversationId]
  );

  const unreadCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) =>
          total + conversation.unreadCount,
        0
      ),
    [conversations]
  );

  // ====================================================
  // FETCH CURRENT USER
  // ====================================================

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

      const user = data.user ?? null;

      setCurrentUser(user);

      return user as CurrentUser | null;
    } catch (error) {
      console.error("FETCH CURRENT USER ERROR:", error);

      return null;
    }
  }, []);

  // ====================================================
  // FETCH CONVERSATIONS
  // ====================================================

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError(null);

      const response = await fetch(
        "/api/messages/conversations",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load conversations."
        );
      }

      const normalized: ConversationItem[] = (
        data.conversations ?? []
      ).map(normalizeConversation);

      setConversations(normalized);

      setSelectedConversationId((current) => {
        if (
          current &&
          normalized.some(
            (conversation) => conversation.id === current
          )
        ) {
          return current;
        }

        return normalized[0]?.id ?? null;
      });

      return normalized;
    } catch (error) {
      console.error("FETCH CONVERSATIONS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load conversations."
      );

      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // ====================================================
  // INITIALIZE DASHBOARD
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      // Load the authenticated user first so unread
      // messages can be correctly identified.
      await fetchCurrentUser();

      if (!mounted) return;

      await fetchConversations();
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, [fetchCurrentUser, fetchConversations]);

  // ====================================================
  // START NEW CONVERSATION
  // ====================================================

  const handleMessageStarted = useCallback(
    async (message: ApiMessage) => {
      if (!message?.project?._id || !message?.threadId) {
        return;
      }

      const conversationId =
        `${message.project._id}-${message.threadId}`;

      await fetchConversations();

      setSelectedConversationId(conversationId);
      setShowSidebar(false);
    },
    [fetchConversations]
  );

  // ====================================================
  // FETCH THREAD MESSAGES
  // ====================================================

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
          throw new Error(
            data.error || "Unable to load messages."
          );
        }

        const normalized: ChatMessage[] = (
          data.messages ?? []
        )
          .map(normalizeMessage)
          .reverse();

        setMessages(normalized);

        const hasUnread = normalized.some(
          (message) =>
            message.recipientId === currentUser?._id &&
            !message.read
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
                  ? {
                      ...item,
                      unread: false,
                      unreadCount: 0,
                    }
                  : item
              )
            );
          }
        }
      } catch (error) {
        console.error(
          "FETCH THREAD MESSAGES ERROR:",
          error
        );

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

  // ====================================================
  // SELECTED CONVERSATION EFFECT
  // ====================================================

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setMessageError(null);
      setLoadingMessages(false);
      return;
    }

    void fetchMessages(selectedConversation);
  }, [selectedConversation, fetchMessages]);

  // ====================================================
  // SELECT CONVERSATION
  // ====================================================

  const handleSelectConversation = useCallback(
    (id: string) => {
      setSelectedConversationId(id);
      setShowSidebar(false);
      setMessageError(null);
    },
    []
  );

  // ====================================================
  // SEND MESSAGE
  // ====================================================

  const handleSendMessage = useCallback(
    async (
      content: string,
      attachments: File[] = [],
      replyTo?: string
    ) => {
      if (
        !selectedConversation ||
        (!content.trim() && attachments.length === 0)
      ) {
        return false;
      }

      try {
        setMessageError(null);

        const formData = new FormData();

        formData.append(
          "projectId",
          selectedConversation.projectId
        );

        formData.append(
          "recipientId",
          selectedConversation.participant._id
        );

        formData.append("content", content.trim());

        formData.append(
          "threadId",
          selectedConversation.threadId
        );

        if (selectedConversation.taskId) {
          formData.append(
            "taskId",
            selectedConversation.taskId
          );
        }

        if (replyTo) {
          formData.append("replyTo", replyTo);
        }

        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        const response = await fetch("/api/messages", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to send message."
          );
        }

        if (data.message) {
          const normalized = normalizeMessage(
            data.message
          );

          setMessages((previous) => [
            ...previous,
            normalized,
          ]);
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

  // ====================================================
  // LOADING
  // ====================================================

  if (loadingConversations) {
    return <MessagesSkeleton />;
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <InboxError
        error={error}
        onRetry={() => void fetchConversations()}
      />
    );
  }

  // ====================================================
  // EMPTY INBOX
  // ====================================================

  if (!conversations.length) {
    return (
      <EmptyInbox onStarted={handleMessageStarted} />
    );
  }

  // ====================================================
  // MAIN DASHBOARD
  // ====================================================

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* Dashboard heading */}
        <PageHeading
          unreadCount={unreadCount}
          conversationCount={conversations.length}
        />

        {/* Messaging workspace */}
        <div className="mt-6 grid min-h-[620px] overflow-hidden rounded-2xl border border-[#e1e6ee] bg-white shadow-[0_5px_30px_rgba(23,43,77,0.045)] lg:min-h-[calc(100vh-270px)] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">

          {/* ==========================================
              SIDEBAR
          ========================================== */}

          <aside
            className={[
              "min-h-[560px] min-w-0 flex-col border-r border-[#e8ecf2] bg-white",
              showSidebar ? "flex" : "hidden",
              "lg:flex",
            ].join(" ")}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between border-b border-[#edf0f4] px-5 py-[19px]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[13px] font-semibold tracking-tight text-[#253249]">
                    Conversations
                  </h2>

                  <span className="h-1.5 w-1.5 rounded-full bg-[#36a477]" />
                </div>

                <p className="mt-1 text-[11px] text-[#8994a6]">
                  Your project discussions
                </p>
              </div>

              <span className="flex h-7 min-w-7 items-center justify-center rounded-lg border border-[#e4eaf2] bg-[#f4f7fb] px-2 text-[11px] font-semibold tabular-nums text-[#28456f]">
                {conversations.length}
              </span>
            </div>

            {/* Conversation list */}
            <div className="min-h-0 flex-1">
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
            </div>
          </aside>

          {/* ==========================================
              MAIN CONVERSATION AREA
          ========================================== */}

          <main
            className={[
              "min-h-[560px] min-w-0 bg-white",
              showSidebar ? "hidden" : "flex flex-col",
              "lg:flex",
            ].join(" ")}
          >
            {selectedConversation ? (
              <div className="flex h-full min-h-[560px] min-w-0 flex-1 flex-col">

                {/* Mobile navigation */}
                <div className="flex items-center justify-between border-b border-[#edf0f4] px-4 py-3 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowSidebar(true)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-[#536176] transition hover:bg-[#f1f4f8]"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    All conversations
                  </button>

                  <span className="text-[10px] font-medium text-[#8994a6]">
                    {conversations.length} discussions
                  </span>
                </div>

                {/* Message error */}
                {messageError && (
                  <div
                    role="alert"
                    className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[#f0d0cc] bg-[#fff7f6] p-3.5 text-xs text-[#a52b20] sm:mx-6"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span className="flex-1 leading-5">
                      {messageError}
                    </span>

                    <button
                      type="button"
                      onClick={() => setMessageError(null)}
                      aria-label="Dismiss error"
                      className="shrink-0 rounded-md p-1 transition hover:bg-[#fce9e6]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Conversation component */}
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
              <div className="flex min-h-[560px] flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e3eaf3] bg-[#f2f5fa] text-[#536d91]">
                  <Inbox className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-base font-semibold tracking-tight text-[#29364c]">
                  Select a conversation
                </h2>

                <p className="mt-2 max-w-xs text-xs leading-6 text-[#8792a5]">
                  Choose a conversation to view messages
                  and continue your discussion.
                </p>
              </div>
            )}
          </main>
        </div>

        {/* ==========================================
            FOOTER
        ========================================== */}

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 pb-2">
          <span className="flex items-center gap-2 text-[11px] text-[#8994a6]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#71839e]" />
            Your project conversations in one place
          </span>

          <span className="flex items-center gap-2 text-[11px] text-[#8994a6]">
            <CheckCheck
              className={[
                "h-3.5 w-3.5",
                unreadCount > 0
                  ? "text-[#4778b9]"
                  : "text-[#36a477]",
              ].join(" ")}
            />

            {unreadCount > 0
              ? `${unreadCount} unread ${
                  unreadCount === 1
                    ? "message"
                    : "messages"
                }`
              : "You're all caught up"}
          </span>
        </footer>
      </div>
    </div>
  );
};
