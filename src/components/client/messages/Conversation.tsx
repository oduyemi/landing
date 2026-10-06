"use client";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { ConversationHeader } from "./ConversationHeader";
import { MessageComposer } from "./Composer";

import type {
  ConversationItem,
  ChatMessage,
} from "./index";

interface ConversationProps {
  conversation: ConversationItem;
  messages: ChatMessage[];
}

export const Conversation = ({
  conversation,
  messages,
}: ConversationProps) => {
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      <ConversationHeader
        conversation={conversation}
      />

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-[760px]">
          {/* Date */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-100" />

            <span className="shrink-0 text-[7px] font-medium text-neutral-400">
              Sep 26, 2026
            </span>

            <div className="h-px flex-1 bg-neutral-100" />
          </div>

          {/* Messages */}
          <div className="space-y-7">
            {messages.map((message, index) => {
              const isClient =
                message.sender === "client";

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
                    delay: index * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={[
                    "flex gap-2.5",
                    isClient
                      ? "justify-end"
                      : "justify-start",
                  ].join(" ")}
                >
                  {!isClient && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[6px] font-semibold text-white">
                      {message.senderInitials}
                    </div>
                  )}

                  <div
                    className={[
                      "max-w-[75%]",
                      isClient
                        ? "items-end"
                        : "items-start",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mb-1 flex items-center gap-2",
                        isClient
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
                        isClient
                          ? "bg-black text-white"
                          : "border border-neutral-200 bg-neutral-50 text-neutral-700",
                      ].join(" ")}
                    >
                      <p className="text-[10px] leading-[1.65]">
                        {message.content}
                      </p>

                      {message.attachment && (
                        <div className="mt-3 flex items-center gap-2.5 rounded-[5px] border border-neutral-200 bg-white px-2.5 py-2 text-black">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-neutral-100">
                            <FileText
                              size={12}
                              strokeWidth={1.5}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[7px] font-medium">
                              {message.attachment.name}
                            </p>

                            <p className="mt-0.5 text-[6px] text-neutral-400">
                              {message.attachment.type}
                              {" · "}
                              {message.attachment.size}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isClient && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[6px] font-semibold text-neutral-700">
                      {message.senderInitials}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <MessageComposer />
    </section>
  );
};