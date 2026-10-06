"use client";
import { useMemo, useState } from "react";
import { ProjectConversationList } from "./ConversationList";
import { Conversation } from "./Conversation";


export interface ConversationItem {
  id: string;
  projectId: string;
  projectName: string;
  projectType: string;
  taskId?: string;
  taskTitle?: string;

  participant: string;
  participantRole: "Admin" | "Client";
  participantInitials: string;

  lastMessage: string;
  lastMessageTime: string;
  unread?: boolean;
}

export interface ChatMessage {
  id: string;

  sender: "client" | "admin";
  senderName: string;
  senderInitials: string;

  content: string;
  timestamp: string;

  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

const conversations: ConversationItem[] = [
  {
    id: "global-crossfire-general",
    projectId: "global-crossfire",
    projectName: "Global Crossfire Church",
    projectType: "Website Development",

    participant: "Yemi",
    participantRole: "Admin",
    participantInitials: "Y",

    lastMessage: "Yes, I'll make that adjustment.",
    lastMessageTime: "10:42 AM",
  },

  {
    id: "global-crossfire-homepage",
    projectId: "global-crossfire",
    projectName: "Global Crossfire Church",
    projectType: "Website Development",

    taskId: "homepage-design",
    taskTitle: "Homepage Design",

    participant: "Yemi",
    participantRole: "Admin",
    participantInitials: "Y",

    lastMessage:
      "I've updated the latest homepage design.",
    lastMessageTime: "Yesterday",
    unread: true,
  },

  {
    id: "cleo-astro-general",
    projectId: "cleo-astro",
    projectName: "Cleo Astro",
    projectType: "Website Development",

    participant: "Yemi",
    participantRole: "Admin",
    participantInitials: "Y",

    lastMessage:
      "The latest homepage design is ready.",
    lastMessageTime: "Sep 25",
  },

  {
    id: "cleo-astro-api",
    projectId: "cleo-astro",
    projectName: "Cleo Astro",
    projectType: "Website Development",

    taskId: "vedic-api",
    taskTitle: "Vedic Astrology API",

    participant: "Yemi",
    participantRole: "Admin",
    participantInitials: "Y",

    lastMessage:
      "The API integration is progressing well.",
    lastMessageTime: "Sep 24",
  },

  {
    id: "alaso-general",
    projectId: "alaso",
    projectName: "Alaso",
    projectType: "Website Development",

    participant: "Yemi",
    participantRole: "Admin",
    participantInitials: "Y",

    lastMessage:
      "I'll share the next update shortly.",
    lastMessageTime: "Sep 23",
  },
];

const messages: Record<string, ChatMessage[]> = {
  "global-crossfire-general": [
    {
      id: "message-1",
      sender: "admin",
      senderName: "Yemi",
      senderInitials: "Y",
      content:
        "I've updated the revised homepage. Please review the latest version and let me know if you're happy with the direction.",
      timestamp: "10:02 AM",
    },

    {
      id: "message-2",
      sender: "admin",
      senderName: "Yemi",
      senderInitials: "Y",
      content:
        "I've also attached the latest homepage design for your review.",
      timestamp: "10:04 AM",
      attachment: {
        name: "homepage-v2.png",
        size: "2.8 MB",
        type: "PNG",
      },
    },

    {
      id: "message-3",
      sender: "client",
      senderName: "Charles M.",
      senderInitials: "CM",
      content:
        "Looks good. Can we make the hero image slightly darker?",
      timestamp: "10:41 AM",
    },

    {
      id: "message-4",
      sender: "admin",
      senderName: "Yemi",
      senderInitials: "Y",
      content:
        "Yes, I'll make that adjustment.",
      timestamp: "10:42 AM",
    },
  ],

  "global-crossfire-homepage": [
    {
      id: "message-5",
      sender: "admin",
      senderName: "Yemi",
      senderInitials: "Y",
      content:
        "I've updated the latest homepage design. Please take a look when you have a moment.",
      timestamp: "Yesterday",
    },

    {
      id: "message-6",
      sender: "client",
      senderName: "Charles M.",
      senderInitials: "CM",
      content:
        "The overall direction looks good.",
      timestamp: "Yesterday",
    },
  ],

  "cleo-astro-general": [
    {
      id: "message-7",
      sender: "admin",
      senderName: "Yemi",
      senderInitials: "Y",
      content:
        "The latest homepage design is ready.",
      timestamp: "Sep 25",
    },
  ],

  "cleo-astro-api": [
    {
      id: "message-8",
      sender: "admin",
      senderName: "Yemi",
      senderInitials: "Y",
      content:
        "The API integration is progressing well. I'll share another update shortly.",
      timestamp: "Sep 24",
    },
  ],

  "alaso-general": [
    {
      id: "message-9",
      sender: "admin",
      senderName: "Yemi",
      senderInitials: "Y",
      content:
        "I'll share the next update shortly.",
      timestamp: "Sep 23",
    },
  ],
};

export const MessagesDashboard = () => {
  const [selectedConversationId, setSelectedConversationId] =
    useState("global-crossfire-general");

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id === selectedConversationId
      ) ?? conversations[0],
    [selectedConversationId]
  );

  const selectedMessages =
    messages[selectedConversation.id] ?? [];

  return (
    <section className="h-full min-h-0 w-full bg-[#fafafa]">
      <div className="flex min-h-[calc(100vh-120px)] overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <ProjectConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />

        <Conversation
          conversation={selectedConversation}
          messages={selectedMessages}
        />
      </div>
    </section>
  );
};