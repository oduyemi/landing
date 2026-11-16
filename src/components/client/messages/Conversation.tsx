
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ConversationHeader } from "./ConversationHeader";
import { MessageComposer } from "./Composer";
import type {
  ConversationItem,
  ChatMessage,
  ChatAttachment,
} from "./index";

import {
  FileText,
  ExternalLink,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";

interface ConversationProps {
  conversation: ConversationItem;
  messages: ChatMessage[];
  loading?: boolean;
  currentUserId?: string;
  onSendMessage: (
    content: string,
    attachments?: File[],
    replyTo?: string
  ) => Promise<boolean>;
}

function MessageAttachments({
  attachments,
  isCurrentUser,
}: {
  attachments: ChatAttachment[];
  isCurrentUser: boolean;
}) {
  if (!attachments?.length) return null;

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => {
        const isImage =
          attachment.resourceType === "image" ||
          attachment.type.startsWith("image/");

        if (isImage) {
          return (
            <a
              key={attachment.publicId || attachment.url}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-xl border border-white/10 bg-black/5"
            >
              <img
                src={attachment.url}
                alt={attachment.name || "Message attachment"}
                className="max-h-[360px] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                onError={(event) => {
                  console.error(
                    "Unable to load message image:",
                    attachment.url
                  );
                  event.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>
          );
        }

        return (
          <a
            key={attachment.publicId || attachment.url}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
              isCurrentUser
                ? "border-white/10 bg-white/10 hover:bg-white/15"
                : "border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                isCurrentUser
                  ? "bg-white/10 text-white"
                  : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200",
              ].join(" ")}
            >
              <FileText className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={[
                  "truncate text-xs font-semibold",
                  isCurrentUser
                    ? "text-white"
                    : "text-neutral-800",
                ].join(" ")}
              >
                {attachment.name || "Attached file"}
              </p>

              <p
                className={[
                  "mt-1 text-[10px]",
                  isCurrentUser
                    ? "text-white/50"
                    : "text-neutral-400",
                ].join(" ")}
              >
                {(attachment.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <ExternalLink
              className={[
                "h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                isCurrentUser
                  ? "text-white/50"
                  : "text-neutral-400",
              ].join(" ")}
            />
          </a>
        );
      })}
    </div>
  );
}

function ConversationLoading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <MessagesSquare className="h-5 w-5 text-neutral-500" />

          <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-neutral-900" />
        </div>

        <p className="mt-4 text-xs font-medium text-neutral-700">
          Loading conversation
        </p>

        <p className="mt-1 text-[11px] text-neutral-400">
          Getting your messages ready...
        </p>
      </div>
    </div>
  );
}

function EmptyConversation() {
  return (
    <div className="flex min-h-[360px] items-center justify-center px-5">
      <div className="flex max-w-[280px] flex-col items-center text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-sm">
          <MessageCircle className="h-7 w-7 text-neutral-400" />

          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neutral-900 text-white">
            <span className="text-[10px] font-bold">+</span>
          </div>
        </div>

        <h3 className="mt-5 text-sm font-semibold tracking-tight text-neutral-900">
          Start a conversation
        </h3>

        <p className="mt-2 text-xs leading-6 text-neutral-500">
          No messages here yet. Send a message below to
          get the conversation going.
        </p>
      </div>
    </div>
  );
}

export const Conversation = ({
  conversation,
  messages,
  loading = false,
  currentUserId,
  onSendMessage,
}: ConversationProps) => {
  const sortedMessages = [...messages].reverse();

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <ConversationHeader conversation={conversation} />

      {/* Messages area */}
      <div className="relative min-h-0 flex-1 overflow-y-auto bg-[#FAFAFA] px-4 py-6 sm:px-6">
        {/* Subtle background texture */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.025),transparent_55%)]" />

        <div className="relative mx-auto max-w-[820px]">
          {loading ? (
            <ConversationLoading />
          ) : messages.length === 0 ? (
            <EmptyConversation />
          ) : (
            <>
              {/* Conversation divider */}
              <div className="mb-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-neutral-200/70" />

                <span className="rounded-full border border-neutral-200/80 bg-white px-3 py-1 text-[10px] font-medium tracking-wide text-neutral-400 shadow-sm">
                  Conversation
                </span>

                <div className="h-px flex-1 bg-neutral-200/70" />
              </div>

              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {sortedMessages.map((message, index) => {
                    const isCurrentUser =
                      message.senderId === currentUserId;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          delay: Math.min(index * 0.015, 0.12),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={[
                          "group flex items-end gap-3",
                          isCurrentUser
                            ? "justify-end"
                            : "justify-start",
                        ].join(" ")}
                      >
                        {/* Sender avatar */}
                        {!isCurrentUser && (
                          <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-600 shadow-sm">
                            {message.senderInitials}
                          </div>
                        )}

                        {/* Message content */}
                        <div
                          className={[
                            "flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%]",
                            isCurrentUser
                              ? "items-end"
                              : "items-start",
                          ].join(" ")}
                        >
                          {/* Message metadata */}
                          <div
                            className={[
                              "mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 px-1",
                              isCurrentUser
                                ? "justify-end"
                                : "justify-start",
                            ].join(" ")}
                          >
                            <span className="text-[11px] font-semibold text-neutral-800">
                              {message.senderName}
                            </span>

                            <span className="text-[10px] text-neutral-400">
                              {message.timestamp}
                            </span>
                          </div>

                          {/* Bubble */}
                          <div
                            className={[
                              "relative min-w-0 rounded-2xl px-4 py-3 shadow-sm transition-shadow duration-200 group-hover:shadow-md",
                              isCurrentUser
                                ? "rounded-br-md bg-neutral-900 text-white"
                                : "rounded-bl-md border border-neutral-200/80 bg-white text-neutral-700",
                            ].join(" ")}
                          >
                            {/* Reply preview */}
                            {message.replyTo && (
                              <div
                                className={[
                                  "mb-3 overflow-hidden rounded-lg border-l-[3px] px-3 py-2",
                                  isCurrentUser
                                    ? "border-white/40 bg-white/10"
                                    : "border-neutral-300 bg-neutral-50",
                                ].join(" ")}
                              >
                                <p
                                  className={[
                                    "text-[10px] font-semibold",
                                    isCurrentUser
                                      ? "text-white/80"
                                      : "text-neutral-700",
                                  ].join(" ")}
                                >
                                  {message.replyTo.senderName}
                                </p>

                                <p
                                  className={[
                                    "mt-1 line-clamp-2 break-words text-[11px] leading-5",
                                    isCurrentUser
                                      ? "text-white/60"
                                      : "text-neutral-500",
                                  ].join(" ")}
                                >
                                  {message.replyTo.content}
                                </p>
                              </div>
                            )}

                            {/* Text */}
                            {message.content && (
                              <p className="whitespace-pre-wrap break-words text-[12px] leading-[1.8]">
                                {message.content}
                              </p>
                            )}

                            {/* Attachments */}
                            {message.attachments &&
                              message.attachments.length > 0 && (
                                <MessageAttachments
                                  attachments={message.attachments}
                                  isCurrentUser={isCurrentUser}
                                />
                              )}
                          </div>
                        </div>

                        {/* Current user avatar */}
                        {isCurrentUser && (
                          <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-[10px] font-semibold text-neutral-700 shadow-sm">
                            {message.senderInitials}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="relative border-t border-neutral-200/80 bg-white">
        <MessageComposer onSendMessage={onSendMessage} />
      </div>
    </section>
  );
};
