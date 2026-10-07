"use client";
import { MoreHorizontal, Search } from "lucide-react";


import type {
  ConversationItem,
} from "./index";

interface ConversationHeaderProps {
  conversation: ConversationItem;
}


export const ConversationHeader = ({conversation}: ConversationHeaderProps) => {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-5 py-4">
      <div className="min-w-0 pt-5">
        <h1 className="truncate text-[12px] font-semibold tracking-[-0.015em] text-black">
          {conversation.projectName}
        </h1>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[7px] text-neutral-400">
            {conversation.projectType}
          </span>

          <span className="text-[7px] text-neutral-300">
            /
          </span>

          <span className="text-[7px] font-medium text-neutral-500">
            {conversation.taskTitle ??
              "General conversation"}
          </span>
        </div>

        <p className="mt-1 text-[6px] text-neutral-300">
          {conversation.participant.fname}{" "}
          {conversation.participant.lname}
          {" · "}
          {conversation.participantRole}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Search conversation"
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
        >
          <Search
            size={12}
            strokeWidth={1.7}
          />
        </button>

        <button
          type="button"
          aria-label="Conversation options"
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
        >
          <MoreHorizontal
            size={13}
            strokeWidth={1.7}
          />
        </button>
      </div>
    </header>
  );
};