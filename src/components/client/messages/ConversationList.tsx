"use client";
import { MessageSquare, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { ApiMessage, ConversationItem } from "./index";
import { StartMessaging } from "./StartMessaging";


interface ConversationListProps {
  conversations: ConversationItem[];
  selectedConversationId: string | null;
  onSelect: (conversation: ConversationItem) => void;
  onMessageStarted?: (message: ApiMessage) => void;
}



export const ConversationList = ({conversations, selectedConversationId,
  onSelect,
  onMessageStarted,
}: ConversationListProps) => {
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const participant =
        `${conversation.participant.fname ?? ""} ${conversation.participant.lname ?? ""}`;

      return [
        conversation.projectName,
        conversation.projectType,
        conversation.taskTitle,
        participant,
        conversation.lastMessage,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        );
    });
  }, [conversations, search]);

  const grouped = useMemo(() => {
    return filteredConversations.reduce<
      Record<string, ConversationItem[]>
    >((groups, conversation) => {
      const key = conversation.projectId;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(conversation);

      return groups;
    }, {});
  }, [filteredConversations]);

  return (
    <aside className="flex w-[255px] shrink-0 flex-col border-r border-neutral-200 bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-neutral-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-semibold text-black">
              Messages
            </h2>

            <p className="mt-0.5 text-[7px] text-neutral-400">
              Conversations by project
            </p>
          </div>

          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-100 px-1.5 text-[7px] font-medium text-neutral-500">
            {conversations.length}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-[5px] border border-neutral-200 px-2.5">
            <Search
              className="h-3 w-3 shrink-0 text-neutral-400"
              strokeWidth={1.7}
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search conversations..."
              className="min-w-0 flex-1 bg-transparent text-[8px] text-black outline-none placeholder:text-neutral-400"
            />
          </div>

          <StartMessaging
            compact
            onStarted={onMessageStarted}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
              <MessageSquare
                className="h-3.5 w-3.5 text-neutral-500"
                strokeWidth={1.6}
              />
            </div>

            <p className="mt-3 text-[9px] font-medium text-neutral-600">
              {search
                ? "No conversations found"
                : "No conversations yet"}
            </p>

            {!search && (
              <>
                <p className="mt-1 max-w-[170px] text-[7px] leading-relaxed text-neutral-400">
                  Start a conversation with your project
                  team.
                </p>

                <div className="mt-4">
                  <StartMessaging
                    onStarted={onMessageStarted}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(
            ([projectId, projectConversations]) => (
              <div
                key={projectId}
                className="mb-4 last:mb-0"
              >
                <div className="px-2 pb-1.5 pt-1">
                  <p className="truncate text-[7px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                    {projectConversations[0].projectName}
                  </p>
                </div>

                <div className="space-y-0.5">
                  {projectConversations.map(
                    (conversation) => {
                      const active =
                        conversation.id ===
                        selectedConversationId;

                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() =>
                            onSelect(conversation)
                          }
                          className={[
                            "w-full rounded-[6px] px-2.5 py-2 text-left transition-colors",
                            active
                              ? "bg-neutral-100"
                              : "hover:bg-neutral-50",
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[7px] font-semibold text-white">
                              {
                                conversation.participantInitials
                              }
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[8px] font-semibold text-black">
                                  {conversation.participant.fname ??
                                    "User"}{" "}
                                  {conversation.participant.lname ??
                                    ""}
                                </p>

                                {conversation.unread && (
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                                )}
                              </div>

                              <p className="mt-0.5 truncate text-[7px] text-neutral-400">
                                {conversation.lastMessage}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            ),
          )
        )}
      </div>
    </aside>
  );
};