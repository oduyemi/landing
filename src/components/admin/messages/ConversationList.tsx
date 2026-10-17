
"use client";
import { useMemo, useState } from "react";
import { Search, MessageSquare, CheckCheck, Circle, X } from "lucide-react";

export interface Conversation {
  threadId: string;
  projectId: string;
  projectTitle: string;
  clientId?: string;
  clientName: string;
  clientImage?: string | null;
  lastMessage: string;
  lastMessageAt: string | Date;
  unreadCount: number;
  lastMessageSenderId?: string;
  lastMessageSenderName?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedThreadId?: string | null;
  currentUserId: string;
  loading?: boolean;
  onSelect: (conversation: Conversation) => void;
  onRefresh?: () => void;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatMessageTime(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

export const ConversationList = ({
  conversations,
  selectedThreadId,
  currentUserId,
  loading = false,
  onSelect,
  onRefresh,
}: ConversationListProps) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const matchesSearch =
        !query ||
        conversation.projectTitle.toLowerCase().includes(query) ||
        conversation.clientName.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || conversation.unreadCount > 0;

      return matchesSearch && matchesFilter;
    });
  }, [conversations, search, filter]);

  const totalUnread = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden border-r border-neutral-200 bg-white">
      {/* Header */}
      <div className="border-b border-neutral-100 px-4 pb-4 pt-5 sm:px-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-neutral-950">
              Messages
            </h2>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Project conversations and client communication.
            </p>
          </div>

          {totalUnread > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-neutral-950 px-2 text-[10px] font-semibold text-white">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="flex h-9 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50/70 px-3 transition focus-within:border-neutral-400 focus-within:bg-white">
          <Search
            size={14}
            className="shrink-0 text-neutral-400"
            aria-hidden="true"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search messages..."
            aria-label="Search conversations"
            className="min-w-0 flex-1 bg-transparent text-xs text-neutral-800 outline-none placeholder:text-neutral-400"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="rounded p-0.5 text-neutral-400 hover:text-neutral-800"
            >
              <X size={13} />
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh conversations"
              aria-label="Refresh conversations"
              className="shrink-0 rounded p-1 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-900"
            >
              <CheckCheck size={14} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mt-3 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
            className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
              filter === "all"
                ? "bg-neutral-950 text-white"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            All conversations
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            aria-pressed={filter === "unread"}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
              filter === "unread"
                ? "bg-neutral-950 text-white"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            Unread

            {totalUnread > 0 && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  filter === "unread" ? "bg-white" : "bg-neutral-950"
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-3" aria-label="Loading conversations">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse gap-3 rounded-md p-3"
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-100" />

                <div className="min-w-0 flex-1 space-y-2 pt-1">
                  <div className="h-3 w-2/3 rounded bg-neutral-100" />
                  <div className="h-2.5 w-full rounded bg-neutral-100" />
                  <div className="h-2.5 w-1/2 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
              <MessageSquare
                size={17}
                className="text-neutral-400"
                aria-hidden="true"
              />
            </div>

            <p className="text-sm font-medium text-neutral-800">
              {search || filter === "unread"
                ? "No conversations found"
                : "No messages yet"}
            </p>

            <p className="mt-1 max-w-52 text-xs leading-5 text-neutral-500">
              {search
                ? "Try another project, client, or message keyword."
                : filter === "unread"
                  ? "You're all caught up on unread conversations."
                  : "Project conversations will appear here when messages are available."}
            </p>

            {(search || filter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-4 text-xs font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-500"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {filteredConversations.map((conversation) => {
              const selected =
                selectedThreadId === conversation.threadId;

              const unread = conversation.unreadCount > 0;

              const sentByAdmin =
                conversation.lastMessageSenderId === currentUserId;

              return (
                <button
                  key={`${conversation.projectId}:${conversation.threadId}`}
                  type="button"
                  onClick={() => onSelect(conversation)}
                  aria-current={selected ? "true" : undefined}
                  className={`group flex w-full gap-3 rounded-lg border p-3 text-left transition ${
                    selected
                      ? "border-neutral-200 bg-neutral-50"
                      : "border-transparent hover:border-neutral-100 hover:bg-neutral-50/70"
                  }`}
                >
                  {/* Client avatar */}
                  <div className="relative mt-0.5 h-9 w-9 shrink-0">
                    {conversation.clientImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={conversation.clientImage}
                        alt=""
                        className="h-9 w-9 rounded-full border border-neutral-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-[10px] font-semibold text-neutral-600">
                        {getInitials(conversation.clientName || "Client")}
                      </div>
                    )}

                    {unread && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-neutral-950" />
                    )}
                  </div>

                  {/* Conversation details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          unread
                            ? "font-semibold text-neutral-950"
                            : "font-medium text-neutral-800"
                        }`}
                      >
                        {conversation.projectTitle}
                      </p>

                      <span className="shrink-0 pt-0.5 text-[10px] text-neutral-400">
                        {formatMessageTime(conversation.lastMessageAt)}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[11px] text-neutral-500">
                      {conversation.clientName}
                    </p>

                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p
                        className={`line-clamp-2 min-w-0 flex-1 text-[11px] leading-[1.55] ${
                          unread
                            ? "font-medium text-neutral-800"
                            : "text-neutral-500"
                        }`}
                      >
                        {sentByAdmin ? "You: " : ""}
                        {conversation.lastMessage || "No message content"}
                      </p>

                      {unread ? (
                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-neutral-950 px-1.5 text-[10px] font-semibold text-white">
                          {conversation.unreadCount > 99
                            ? "99+"
                            : conversation.unreadCount}
                        </span>
                      ) : selected ? (
                        <Circle
                          size={6}
                          className="mb-1 shrink-0 fill-neutral-300 text-neutral-300"
                        />
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && filteredConversations.length > 0 && (
        <div className="border-t border-neutral-100 px-4 py-2.5">
          <p className="text-[10px] text-neutral-400">
            Showing {filteredConversations.length} of {conversations.length}{" "}
            conversations
          </p>
        </div>
      )}
    </section>
  );
}
