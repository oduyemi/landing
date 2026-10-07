"use client";
import { motion } from "framer-motion";
import { ConversationHeader } from "./ConversationHeader";
import { MessageComposer } from "./Composer";
import type {ConversationItem, ChatMessage} from "./index";

interface ConversationProps {
  conversation: ConversationItem;
  messages: ChatMessage[];
  loading?: boolean;
  currentUserId?: string;
  onSendMessage: (
    content: string,
    replyTo?: string
  ) => Promise<boolean>;
}

export const Conversation = ({
  conversation,
  messages,
  loading = false,
  currentUserId,
  onSendMessage,
}: ConversationProps) => {
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      <ConversationHeader
        conversation={conversation}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-[760px]">
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-4 w-4 animate-spin rounded-full border border-neutral-200 border-t-black" />

                <p className="mt-3 text-[7px] text-neutral-400">
                  Loading conversation...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <div className="text-center">
                <p className="text-[9px] font-medium text-black">
                  No messages yet
                </p>

                <p className="mt-1 text-[7px] text-neutral-400">
                  Start the conversation below.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-100" />

                <span className="shrink-0 text-[7px] font-medium text-neutral-400">
                  {messages[0]?.timestamp
                    ? "Conversation"
                    : ""}
                </span>

                <div className="h-px flex-1 bg-neutral-100" />
              </div>

                <div className="space-y-7">
                  {[...messages].reverse().map(
                    (message, index) => {
                    const isCurrentUser =
                      message.senderId ===
                      currentUserId;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{
                          opacity: 0,
                          y: 6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.02,
                          ease: [
                            0.22,
                            1,
                            0.36,
                            1,
                          ],
                        }}
                        className={[
                          "flex gap-2.5",
                          isCurrentUser
                            ? "justify-end"
                            : "justify-start",
                        ].join(" ")}
                      >
                        {!isCurrentUser && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[6px] font-semibold text-white">
                            {message.senderInitials}
                          </div>
                        )}

                        <div
                          className={[
                            "max-w-[75%]",
                            isCurrentUser
                              ? "items-end"
                              : "items-start",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "mb-1 flex items-center gap-2",
                              isCurrentUser
                                ? "justify-end"
                                : "justify-start",
                            ].join(" ")}
                          >
                            <span className="text-[7px] font-semibold text-black">
                              {message.senderName}
                            </span>

                            <span className="text-[6px] text-neutral-400">
                              {message.timestamp}
                            </span>
                          </div>

                          <div
                            className={[
                              "rounded-[7px] px-3 py-2.5",
                              isCurrentUser
                                ? "bg-black text-white"
                                : "border border-neutral-200 bg-neutral-50 text-neutral-700",
                            ].join(" ")}
                          >
                            {message.replyTo && (
                              <div
                                className={[
                                  "mb-2 rounded-[4px] border-l-2 px-2 py-1.5",
                                  isCurrentUser
                                    ? "border-neutral-500 bg-white/10"
                                    : "border-neutral-300 bg-white",
                                ].join(" ")}
                              >
                                <p className="text-[6px] font-semibold opacity-70">
                                  {
                                    message.replyTo
                                      .senderName
                                  }
                                </p>

                                <p className="mt-0.5 line-clamp-2 text-[6px] opacity-60">
                                  {
                                    message.replyTo
                                      .content
                                  }
                                </p>
                              </div>
                            )}

                            <p className="text-[10px] leading-[1.65]">
                              {message.content}
                            </p>
                          </div>
                        </div>

                        {isCurrentUser && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[6px] font-semibold text-neutral-700">
                            {message.senderInitials}
                          </div>
                        )}
                      </motion.div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <MessageComposer
        onSendMessage={onSendMessage}
      />
    </section>
  );
};