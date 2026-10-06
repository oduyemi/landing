"use client";
import { useMemo } from "react";
import { ChevronDown, MessageCircle, Search } from "lucide-react";
import type { ConversationItem } from "./index";


interface ProjectConversationListProps {
  conversations: ConversationItem[];
  selectedConversationId: string;
  onSelectConversation: (id: string) => void;
}


export const ProjectConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ProjectConversationListProps) => {
  const projects = useMemo(() => {
    const grouped = new Map<
      string,
      {
        id: string;
        name: string;
        type: string;
        conversations: ConversationItem[];
      }
    >();

    conversations.forEach((conversation) => {
      if (!grouped.has(conversation.projectId)) {
        grouped.set(conversation.projectId, {
          id: conversation.projectId,
          name: conversation.projectName,
          type: conversation.projectType,
          conversations: [],
        });
      }

      grouped
        .get(conversation.projectId)!
        .conversations.push(conversation);
    });

    return Array.from(grouped.values());
  }, [conversations]);

  return (
    <aside className="hidden w-[255px] shrink-0 border-r border-neutral-200 bg-neutral-50/30 md:flex md:flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-neutral-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-semibold text-black">
              Messages
            </h2>

            <p className="mt-0.5 text-[7px] text-neutral-400">
              Conversations by project
            </p>
          </div>

          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-neutral-100 px-1.5 text-[7px] font-medium text-neutral-500">
            {conversations.length}
          </span>
        </div>

        {/* Search */}
        <div className="mt-4 flex h-8 items-center gap-2 rounded-[5px] border border-neutral-200 bg-white px-2.5">
          <Search
            size={10}
            strokeWidth={1.7}
            className="shrink-0 text-neutral-400"
          />

          <input
            type="text"
            placeholder="Search messages..."
            className="min-w-0 flex-1 bg-transparent text-[10px] text-black outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Project list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id}>
              {/* Project heading */}
              <div className="flex items-center gap-2 px-2.5 pb-1.5">
                <ChevronDown
                  size={10}
                  strokeWidth={1.7}
                  className="text-neutral-400"
                />

                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-black">
                    {project.name}
                  </p>

                  <p className="mt-0.5 truncate text-[6px] text-neutral-400">
                    {project.type}
                  </p>
                </div>
              </div>

              {/* Threads */}
              <div className="space-y-0.5">
                {project.conversations.map(
                  (conversation) => {
                    const active =
                      conversation.id ===
                      selectedConversationId;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() =>
                          onSelectConversation(
                            conversation.id
                          )
                        }
                        className={[
                          "group flex w-full items-start gap-2.5 rounded-[5px]",
                          "px-2.5 py-2.5 text-left",
                          "transition-colors",
                          active
                            ? "bg-white shadow-[0_1px_5px_rgba(0,0,0,0.045)]"
                            : "hover:bg-white/70",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                            active
                              ? "bg-black text-white"
                              : "bg-neutral-200 text-neutral-600",
                          ].join(" ")}
                        >
                          <MessageCircle
                            size={10}
                            strokeWidth={1.6}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={[
                                "truncate text-[7.5px]",
                                active
                                  ? "font-semibold text-black"
                                  : "font-medium text-neutral-700",
                              ].join(" ")}
                            >
                              {conversation.taskTitle ??
                                "General conversation"}
                            </p>

                            <span className="shrink-0 text-[6px] text-neutral-400">
                              {
                                conversation.lastMessageTime
                              }
                            </span>
                          </div>

                          <p className="mt-1 truncate text-[6.5px] leading-[1.4] text-neutral-400">
                            {conversation.lastMessage}
                          </p>

                          {conversation.unread && (
                            <span className="mt-1.5 block h-1 w-1 rounded-full bg-black" />
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};