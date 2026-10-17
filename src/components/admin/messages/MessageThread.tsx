
"use client";
import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Building2, Check, CheckCheck, MessageSquare, MoreHorizontal } from "lucide-react";
import type { Conversation } from "./ConversationList";

export interface ThreadMessage {
  _id: string;
  content: string;
  sender: string | {
    _id: string;
    fname?: string;
    lname?: string;
    image?: string | null;
    role?: string;
  };
  recipient?: string | {
    _id: string;
    fname?: string;
    lname?: string;
    image?: string | null;
    role?: string;
  };
  createdAt: string | Date;
  read?: boolean;
  readAt?: string | Date | null;
  replyTo?: string | null;
}

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: ThreadMessage[];
  currentUserId: string;
  loading?: boolean;
  error?: string | null;
  onBack?: () => void;
  onRetry?: () => void;
  onOpenDetails?: () => void;
  onMarkRead?: (messageId: string) => void;
}

function getId(
  value: string | { _id: string } | null | undefined
): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id;
}

function getPersonName(
  value: string | {
    _id: string;
    fname?: string;
    lname?: string;
  }
) {
  if (typeof value === "string") return "Conversation participant";

  const name = [value.fname, value.lname].filter(Boolean).join(" ");
  return name || "Conversation participant";
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

function formatTime(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateDivider(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === now.getFullYear()
        ? undefined
        : "numeric",
  });
}

function sameDay(a: string | Date, b: string | Date) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function Avatar({
  name,
  image,
  size = "sm",
}: {
  name: string;
  image?: string | null;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "md" ? "h-9 w-9 text-[10px]" : "h-7 w-7 text-[9px]";

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full border border-neutral-200 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 font-semibold text-neutral-600`}
      aria-hidden="true"
    >
      {getInitials(name || "User")}
    </div>
  );
}

export const MessageThread = ({
  conversation,
  messages,
  currentUserId,
  loading = false,
  error = null,
  onBack,
  onRetry,
  onOpenDetails,
  onMarkRead,
}: MessageThreadProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const orderedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      ),
    [messages]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [orderedMessages.length, conversation?.threadId]);

  useEffect(() => {
    if (!conversation || loading || !onMarkRead) return;

    orderedMessages.forEach((message) => {
      const senderId = getId(message.sender);

      if (
        senderId !== currentUserId &&
        message.read !== true
      ) {
        onMarkRead(message._id);
      }
    });
  }, [
    conversation?.threadId,
    currentUserId,
    loading,
    onMarkRead,
    orderedMessages,
  ]);

  if (!conversation) {
    return (
      <section className="flex h-full min-h-0 flex-col items-center justify-center bg-white px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
          <MessageSquare
            size={20}
            className="text-neutral-400"
            aria-hidden="true"
          />
        </div>

        <h2 className="text-sm font-semibold text-neutral-900">
          Your project conversations
        </h2>

        <p className="mt-2 max-w-xs text-xs leading-5 text-neutral-500">
          Select a conversation to view messages and respond to your client.
        </p>
      </section>
    );
  }

  const title = conversation.projectTitle || "Project conversation";
  const clientName = conversation.clientName || "Client";

  return (
    <section className="flex h-full min-h-0 flex-col bg-white">
      {/* Conversation header */}
      <header className="flex min-h-[65px] items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <Avatar
            name={clientName}
            image={conversation.clientImage}
            size="md"
          />

          <div className="min-w-0">
            <h2 className="truncate text-xs font-semibold text-neutral-950 sm:text-sm">
              {title}
            </h2>

            <div className="mt-1 flex min-w-0 items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />

              <p className="truncate text-[10px] text-neutral-500 sm:text-[11px]">
                {clientName}
              </p>

              <span className="text-neutral-300">·</span>

              <span className="truncate text-[10px] text-neutral-400">
                Project conversation
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onOpenDetails && (
            <button
              type="button"
              onClick={onOpenDetails}
              aria-label="View conversation details"
              title="Conversation details"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Building2 size={15} />
            </button>
          )}

          <button
            type="button"
            aria-label="More conversation options"
            title="More options"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </header>

      {/* Project context */}
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
          <Building2 size={12} className="shrink-0" />

          <span className="shrink-0">Project</span>

          <span className="text-neutral-300">/</span>

          <span className="truncate font-medium text-neutral-700">
            {title}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
        aria-label="Message history"
        aria-live="polite"
      >
        {loading ? (
          <div className="space-y-6" aria-label="Loading messages">
            {[
              { own: false, width: "w-2/3" },
              { own: true, width: "w-1/2" },
              { own: false, width: "w-1/2" },
              { own: true, width: "w-2/3" },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex animate-pulse items-end gap-2 ${
                  item.own ? "justify-end" : "justify-start"
                }`}
              >
                {!item.own && (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-100" />
                )}

                <div
                  className={`${item.width} space-y-2 rounded-xl bg-neutral-100 p-4`}
                >
                  <div className="h-2.5 w-full rounded bg-neutral-200" />
                  <div className="h-2.5 w-3/4 rounded bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-neutral-800">
              Couldn't load this conversation
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">
              {error}
            </p>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-700"
              >
                Try again
              </button>
            )}
          </div>
        ) : orderedMessages.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
              <MessageSquare
                size={17}
                className="text-neutral-400"
                aria-hidden="true"
              />
            </div>

            <p className="text-sm font-medium text-neutral-800">
              Start the conversation
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">
              Send a message to discuss updates, feedback, or next steps for this project.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {orderedMessages.map((message, index) => {
              const senderId = getId(message.sender);
              const isOwnMessage = senderId === currentUserId;

              const senderName =
                typeof message.sender === "string"
                  ? isOwnMessage
                    ? "You"
                    : clientName
                  : getPersonName(message.sender);

              const senderImage =
                typeof message.sender === "string"
                  ? undefined
                  : message.sender.image;

              const showDate =
                index === 0 ||
                !sameDay(
                  orderedMessages[index - 1].createdAt,
                  message.createdAt
                );

              const isRead = message.read === true;

              return (
                <div key={message._id} className="space-y-4">
                  {showDate && (
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-neutral-100" />

                      <span className="shrink-0 text-[10px] font-medium text-neutral-400">
                        {formatDateDivider(message.createdAt)}
                      </span>

                      <div className="h-px flex-1 bg-neutral-100" />
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2.5 ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwnMessage && (
                      <Avatar
                        name={senderName}
                        image={senderImage}
                      />
                    )}

                    <div
                      className={`flex max-w-[85%] flex-col sm:max-w-[75%] ${
                        isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="mb-1.5 flex items-center gap-2 px-0.5">
                        <span className="text-[10px] font-medium text-neutral-600">
                          {senderName}
                        </span>

                        <span className="text-[10px] text-neutral-400">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-[1.7] sm:px-4 ${
                          isOwnMessage
                            ? "rounded-br-md bg-neutral-950 text-white"
                            : "rounded-bl-md border border-neutral-200 bg-neutral-50 text-neutral-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>

                      {isOwnMessage && (
                        <div className="mt-1.5 flex items-center gap-1 px-1 text-[9px] text-neutral-400">
                          {isRead ? (
                            <>
                              <CheckCheck
                                size={12}
                                className="text-neutral-600"
                              />
                              <span>Read</span>
                            </>
                          ) : (
                            <>
                              <Check size={12} />
                              <span>Sent</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {isOwnMessage && (
                      <div className="mb-0.5 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[9px] font-semibold text-white sm:flex">
                        {getInitials("You")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </section>
  );
}
