
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConversationList, type Conversation } from "./ConversationList";
import { MessageThread,  type ThreadMessage } from "./MessageThread";
import {MessageComposer} from "./Composer";
import { MessageFilters, type MessageFilterOption } from "./Filters";
import { AlertCircle, ArrowRight, Inbox, MessageSquare, Pencil, RefreshCw, ShieldCheck, X } from "lucide-react";

interface ApiUser {
  _id: string;
  fname?: string;
  lname?: string;
  email?: string;
  image?: string | null;
  role?: string;
}

interface ApiProject {
  _id: string;
  title: string;
  type?: string;
  client?: ApiUser | string | null;
}

interface ApiMessage extends Omit<ThreadMessage, "sender" | "recipient"> {
  sender: ApiUser | string;
  recipient: ApiUser | string;
  project?: ApiProject | string | null;
  threadId: string;
}

interface ApiConversation {
  threadId: string;
  project: ApiProject;
  participant: ApiUser;
  lastMessage: ApiMessage;
  unreadCount: number;
}

interface AdminMessagesProps {
  currentUserId: string;
}

interface NewMessageProject {
  _id: string;
  title: string;
  clientId: string;
}

interface NewMessageRecipient {
  _id: string;
  name: string;
  email?: string;
}

function getId(
  value: string | { _id: string } | null | undefined
): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id;
}

function getFullName(user?: ApiUser | null): string {
  if (!user) return "Unknown user";

  return (
    `${user.fname ?? ""} ${user.lname ?? ""}`.trim() ||
    user.email ||
    "Unknown user"
  );
}

function getErrorMessage(
  data: { error?: string } | null,
  fallback: string
): string {
  return data?.error || fallback;
}

export const AdminMessages = ({currentUserId}: AdminMessagesProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversationError, setConversationError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [newMessageProjects, setNewMessageProjects] = useState<NewMessageProject[]>([]);
  const [newMessageRecipients, setNewMessageRecipients] = useState<NewMessageRecipient[]>([]);
  const [newMessageProjectId, setNewMessageProjectId] = useState("");
  const [newMessageRecipientId, setNewMessageRecipientId] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loadingComposeOptions, setLoadingComposeOptions] = useState(false);
  const [sendingNewMessage, setSendingNewMessage] = useState(false);
  const [newMessageError, setNewMessageError] = useState("");

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    setConversationError("");
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Unable to load conversations.")
        );
      }

      const normalized: Conversation[] = (
        data.conversations as ApiConversation[]
      ).map((item) => {
        const participant = item.participant;
        const lastMessage = item.lastMessage;

        return {
          threadId: item.threadId,
          projectId: item.project._id,
          projectTitle: item.project.title,
          clientId: participant._id,
          clientName: getFullName(participant),
          clientImage: participant.image ?? null,
          lastMessage: lastMessage.content,
          lastMessageAt: lastMessage.createdAt,
          unreadCount: item.unreadCount ?? 0,
          lastMessageSenderId: getId(lastMessage.sender),
          lastMessageSenderName:
            typeof lastMessage.sender === "string"
              ? "User"
              : getFullName(lastMessage.sender),
        };
      });

      setConversations(normalized);
      setSelectedKey((current) => {
        if (
          current &&
          normalized.some(
            (item) => `${item.projectId}:${item.threadId}` === current
          )
        ) {
          return current;
        }
        return current ? null : null;
      });
    } catch (error) {
      setConversationError(
        error instanceof Error
          ? error.message
          : "Unable to load conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const openNewMessage = useCallback(async () => {
    setNewMessageOpen(true);
    setNewMessageError("");
    setNewMessageContent("");
    setNewMessageProjectId("");
    setNewMessageRecipientId("");
    setLoadingComposeOptions(true);
  
    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        fetch("/api/projects", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/tasks/assignees", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);
  
      const [projectsData, usersData] = await Promise.all([
        projectsResponse.json(),
        usersResponse.json(),
      ]);
  
      if (!projectsResponse.ok || projectsData.success === false) {
        throw new Error(projectsData.error || "Unable to load projects.");
      }
  
      if (!usersResponse.ok || usersData.success === false) {
        throw new Error(usersData.error || "Unable to load clients.");
      }
  
      const rawProjects: ApiProject[] =
        projectsData.projects ?? projectsData.data ?? [];
  
      const rawUsers: ApiUser[] =
        usersData.users ?? usersData.data ?? [];
  
      const usersById = new Map(
        rawUsers.map((user) => [user._id, user])
      );
  
      const mappedProjects: NewMessageProject[] = rawProjects
        .map((project) => {
          const clientId =
            typeof project.client === "string"
              ? project.client
              : project.client?._id ?? "";
  
          return {
            _id: project._id,
            title: project.title,
            clientId,
          };
        })
        .filter((project) => Boolean(project._id && project.title));
  
      const mappedRecipients: NewMessageRecipient[] = rawUsers
        .filter((user) => Boolean(user._id))
        .map((user) => ({
          _id: user._id,
          name: getFullName(user),
          email: user.email,
        }));
  
      // Only offer projects with an identifiable client.
      // The server still validates whether the recipient can access the project.
      const projectsWithClients = mappedProjects.filter(
        (project) => project.clientId && usersById.has(project.clientId)
      );
  
      setNewMessageProjects(projectsWithClients);
      setNewMessageRecipients(mappedRecipients);
  
      if (projectsWithClients.length === 0) {
        setNewMessageError(
          "No projects with an identifiable client are available to message."
        );
      }
    } catch (error) {
      setNewMessageError(
        error instanceof Error
          ? error.message
          : "Unable to prepare a new message."
      );
    } finally {
      setLoadingComposeOptions(false);
    }
  }, []);

  const handleSendNewMessage = useCallback(async () => {
    setNewMessageError("");
  
    if (!newMessageProjectId) {
      setNewMessageError("Please select a project.");
      return;
    }
  
    if (!newMessageRecipientId) {
      setNewMessageError("Please select a client.");
      return;
    }
  
    const content = newMessageContent.trim();
  
    if (!content) {
      setNewMessageError("Please enter a message.");
      return;
    }
  
    if (content.length > 5000) {
      setNewMessageError("Your message cannot exceed 5000 characters.");
      return;
    }
  
    setSendingNewMessage(true);
  
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: newMessageProjectId,
          recipientId: newMessageRecipientId,
          content,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Unable to send your message.")
        );
      }
  
      const sentMessage = data.message as ApiMessage;
      const threadId = sentMessage.threadId;
  
      setNewMessageOpen(false);
      setNewMessageContent("");
      setNewMessageProjectId("");
      setNewMessageRecipientId("");
  
      // Refresh the inbox, then select the newly created conversation.
      await loadConversations();
  
      if (threadId) {
        setSelectedKey(`${newMessageProjectId}:${threadId}`);
      } else {
        setSelectedKey(null);
      }
  
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setNewMessageError(
        error instanceof Error
          ? error.message
          : "Unable to send your message."
      );
    } finally {
      setSendingNewMessage(false);
    }
  }, [
    newMessageProjectId,
    newMessageRecipientId,
    newMessageContent,
    loadConversations,
  ]);

  const handleMarkRead = useCallback(async (messageId: string) => {
    const target = messages.find(
      (message) => message._id === messageId
    );

    if (!target || getId(target.recipient) !== currentUserId) {
      return;
    }

    if (target.read) {
      return;
    }

    setMessages((current) =>
      current.map((message) =>
        message._id === messageId
          ? { ...message, read: true, readAt: new Date().toISOString() }
          : message
      )
    );

    try {
      const response = await fetch(
        `/api/messages/${encodeURIComponent(messageId)}/read`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to mark message as read."
        );
      }
      await loadConversations();
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message._id === messageId
            ? { ...message, read: false, readAt: null }
            : message
        )
      );

        console.error("Mark message as read failed:", error);
      }
    },
    [messages, currentUserId, loadConversations]
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations, refreshKey]);

  const projectOptions = useMemo<MessageFilterOption[]>(() => {
    const unique = new Map<string, string>();

    conversations.forEach((conversation) => {
      unique.set(conversation.projectId, conversation.projectTitle);
    });

    return Array.from(unique, ([value, label]) => ({ value, label }));
  }, [conversations]);

  const clientOptions = useMemo<MessageFilterOption[]>(() => {
    const unique = new Map<string, string>();

    conversations.forEach((conversation) => {
      if (conversation.clientId) {
        unique.set(conversation.clientId, conversation.clientName);
      }
    });

    return Array.from(unique, ([value, label]) => ({ value, label }));
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      if (
        selectedProject !== "all" &&
        conversation.projectId !== selectedProject
      ) {
        return false;
      }

      if (
        selectedClient !== "all" &&
        conversation.clientId !== selectedClient
      ) {
        return false;
      }

      if (unreadOnly && conversation.unreadCount < 1) {
        return false;
      }

      return true;
    });
  }, [conversations, selectedProject, selectedClient, unreadOnly]);

  const selectedConversation = useMemo(() => {
    if (!selectedKey) return null;

    return (
      conversations.find(
        (item) => `${item.projectId}:${item.threadId}` === selectedKey
      ) ?? null
    );
  }, [conversations, selectedKey]);

  const loadThread = useCallback(async (conversation: Conversation) => {
    setLoadingMessages(true);
    setMessageError("");
    setMessages([]);

    try {
      const params = new URLSearchParams({
        projectId: conversation.projectId,
        threadId: conversation.threadId,
        limit: "100",
      });

      const response = await fetch(`/api/messages?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Unable to load this conversation.")
        );
      }

      const ordered = (data.messages as ApiMessage[])
        .slice()
        .reverse();

      setMessages(ordered);
    } catch (error) {
      setMessageError(
        error instanceof Error
          ? error.message
          : "Unable to load this conversation."
      );
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      void loadThread(selectedConversation);
    } else {
      setMessages([]);
      setMessageError("");
    }
  }, [selectedConversation, loadThread]);

  const handleSelect = useCallback(
    (conversation: Conversation) => {
      setSelectedKey(`${conversation.projectId}:${conversation.threadId}`);
    },
    []
  );

  const handleSend = useCallback(
    async (content: string) => {
      if (!selectedConversation) {
        throw new Error("Select a conversation before sending a message.");
      }

      const recipientId = selectedConversation.clientId;

      if (!recipientId) {
        throw new Error("The recipient for this conversation is missing.");
      }

      setSending(true);

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: selectedConversation.projectId,
            recipientId,
            content,
            threadId: selectedConversation.threadId,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            getErrorMessage(data, "Unable to send your message.")
          );
        }

        const sentMessage = data.message as ApiMessage;

        setMessages((current) => {
          if (current.some((item) => item._id === sentMessage._id)) {
            return current;
          }

          return [...current, sentMessage];
        });

        await loadConversations();
      } finally {
        setSending(false);
      }
    },
    [selectedConversation, loadConversations]
  );

  const resetFilters = useCallback(() => {
    setSelectedProject("all");
    setSelectedClient("all");
    setUnreadOnly(false);
  }, []);

  const refreshAll = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  
  return (
    <section className="w-full space-y-6">
      {/* Workspace header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Messages
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage conversations and contact clients about their projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openNewMessage}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-black/70 focus:outline-none focus:ring-4 focus:ring-black-100"
          >
            <MessageSquare size={16} />
            New message
          </button>

          <button
            type="button"
            onClick={refreshAll}
            disabled={loadingConversations}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-black-200 hover:bg-black/50 hover:text-black-700 focus:outline-none focus:ring-4 focus:ring-black-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loadingConversations ? "animate-spin" : ""}
            />
            {loadingConversations ? "Refreshing..." : "Refresh inbox"}
          </button>
        </div>
      </header>

      {conversationError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
              <AlertCircle size={18} />
            </span>
            <div>
              <p className="font-semibold">Unable to load your inbox</p>
              <p className="mt-1 leading-5 text-red-600/90">
                {conversationError}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 sm:self-center"
          >
            Try again
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Inbox workspace */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
        {/* Workspace toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-black-50/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black-100 bg-white text-black-600 shadow-sm">
              <Inbox size={19} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">
                Project inbox
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {loadingConversations
                  ? "Syncing conversations..."
                  : `${filteredConversations.length} ${
                      filteredConversations.length === 1
                        ? "conversation"
                        : "conversations"
                    } displayed`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black-100 bg-black/50 px-3 py-1.5 text-xs font-semibold text-black-700">
                <span className="h-1.5 w-1.5 rounded-full bg-black-500" />
                Unread only
              </span>
            )}

            {(selectedProject !== "all" ||
              selectedClient !== "all" ||
              unreadOnly) && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-black-700"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Two-panel messaging layout */}
        <div className="grid min-h-[650px] grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside
            className={[
              "flex min-h-0 flex-col bg-slate-50/60",
              "border-b border-slate-200 lg:border-b-0 lg:border-r",
              "lg:min-h-[650px]",
            ].join(" ")}
          >
            <div className="border-b border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Conversations
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Browse your project discussions
                  </p>
                </div>

                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold tabular-nums text-slate-600">
                  {filteredConversations.length}
                </span>
              </div>

              <MessageFilters
                projects={projectOptions}
                clients={clientOptions}
                selectedProject={selectedProject}
                selectedClient={selectedClient}
                unreadOnly={unreadOnly}
                onProjectChange={setSelectedProject}
                onClientChange={setSelectedClient}
                onUnreadChange={setUnreadOnly}
                onReset={resetFilters}
              />
            </div>

            <div className="min-h-[280px] flex-1 bg-white lg:min-h-0">
              <ConversationList
                conversations={filteredConversations}
                selectedThreadId={selectedKey ?? undefined}
                currentUserId={currentUserId}
                loading={loadingConversations}
                onSelect={handleSelect}
                onRefresh={refreshAll}
              />
            </div>

            <div className="hidden border-t border-slate-200/80 bg-slate-50/80 px-4 py-3 lg:block">
              <p className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                <ShieldCheck size={14} />
                Secure project communication
              </p>
            </div>
          </aside>

          {/* Message thread */}
          <div className="flex min-h-[560px] min-w-0 flex-col bg-white lg:min-h-[650px]">
            <div className="min-h-0 flex-1">
              <MessageThread
                conversation={selectedConversation}
                messages={messages}
                currentUserId={currentUserId}
                loading={loadingMessages}
                error={messageError}
                onBack={() => setSelectedKey(null)}
                onRetry={() => {
                  if (selectedConversation) {
                    void loadThread(selectedConversation);
                  }
                }}
                onMarkRead={handleMarkRead}
              />
            </div>

            {selectedConversation && (
              <div className="border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-3 sm:p-5">
                <div className="mx-auto w-full max-w-5xl">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-black-600">
                      <Pencil size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700">
                        Reply to {selectedConversation.clientName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Keep your message clear and project-focused.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-black-300 focus-within:ring-4 focus-within:ring-black-50">
                    <MessageComposer
                      onSend={handleSend}
                      sending={sending}
                      disabled={loadingMessages || Boolean(messageError)}
                      placeholder={`Message ${selectedConversation.clientName}...`}
                      maxLength={5000}
                    />
                  </div>

                  {messageError && (
                    <p className="mt-2 text-xs text-amber-700">
                      Resolve the conversation loading issue before sending a
                      reply.
                    </p>
                  )}
                </div>
              </div>
            )}

            {!selectedConversation && (
              <div className="hidden border-t border-slate-100 bg-slate-50/50 px-5 py-4 md:block">
                <p className="text-center text-xs text-slate-400">
                  Select a conversation to view messages and reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-2 px-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>Project communication workspace</p>
        <p className="inline-flex items-center gap-1.5">
          <ShieldCheck size={13} />
          Authenticated workspace
        </p>
      </footer>

      {newMessageOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget && !sendingNewMessage) {
        setNewMessageOpen(false);
      }
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-message-title"
      className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-black-50/80 via-white to-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black-100 text-black/70">
            <MessageSquare size={20} />
          </div>

          <div>
            <h2
              id="new-message-title"
              className="text-lg font-bold text-slate-900"
            >
              Start a new conversation
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Choose a project and its client, then write your message.
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close new message dialog"
          disabled={sendingNewMessage}
          onClick={() => setNewMessageOpen(false)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {newMessageError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{newMessageError}</p>
          </div>
        )}

        {loadingComposeOptions ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading projects and clients...
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label
                htmlFor="new-message-project"
                className="text-sm font-semibold text-slate-700"
              >
                Project
              </label>

              <select
                id="new-message-project"
                value={newMessageProjectId}
                onChange={(event) => {
                  setNewMessageProjectId(event.target.value);
                  setNewMessageRecipientId("");
                  setNewMessageError("");
                }}
                disabled={sendingNewMessage}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-black-400 focus:ring-4 focus:ring-black-50 disabled:bg-slate-50"
              >
                <option value="">Choose a project</option>

                {newMessageProjects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="new-message-recipient"
                className="text-sm font-semibold text-slate-700"
              >
                Client
              </label>

              <select
                id="new-message-recipient"
                value={newMessageRecipientId}
                onChange={(event) => {
                  setNewMessageRecipientId(event.target.value);
                  setNewMessageError("");
                }}
                disabled={!newMessageProjectId || sendingNewMessage}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-black-400 focus:ring-4 focus:ring-black-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Choose a client</option>

                {(() => {
                  const project = newMessageProjects.find(
                    (item) => item._id === newMessageProjectId
                  );

                  const recipient = newMessageRecipients.find(
                    (item) => item._id === project?.clientId
                  );

                  return recipient ? (
                    <option value={recipient._id}>
                      {recipient.name}
                      {recipient.email ? ` — ${recipient.email}` : ""}
                    </option>
                  ) : null;
                })()}
              </select>

              <p className="text-xs leading-5 text-slate-400">
                The recipient is linked to the selected project.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="new-message-content"
                  className="text-sm font-semibold text-slate-700"
                >
                  Message
                </label>

                <span className="text-xs tabular-nums text-slate-400">
                  {newMessageContent.length}/5000
                </span>
              </div>

              <textarea
                id="new-message-content"
                value={newMessageContent}
                onChange={(event) => {
                  setNewMessageContent(event.target.value);
                  setNewMessageError("");
                }}
                placeholder="Write your message to the client..."
                rows={5}
                maxLength={5000}
                disabled={sendingNewMessage}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-black-400 focus:ring-4 focus:ring-black-50 disabled:bg-slate-50"
              />
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setNewMessageOpen(false)}
            disabled={sendingNewMessage}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleSendNewMessage()}
            disabled={
              loadingComposeOptions ||
              sendingNewMessage ||
              !newMessageProjectId ||
              !newMessageRecipientId ||
              !newMessageContent.trim()
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-black/70 focus:outline-none focus:ring-4 focus:ring-black-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendingNewMessage ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                Send message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </section>
  );
}