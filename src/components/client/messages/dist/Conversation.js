"use client";
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.Conversation = void 0;
var framer_motion_1 = require("framer-motion");
var ConversationHeader_1 = require("./ConversationHeader");
var Composer_1 = require("./Composer");
var lucide_react_1 = require("lucide-react");
function MessageAttachments(_a) {
    var attachments = _a.attachments;
    if (!(attachments === null || attachments === void 0 ? void 0 : attachments.length))
        return null;
    return (React.createElement("div", { className: "mt-2 space-y-2" }, attachments.map(function (attachment) {
        var isImage = attachment.resourceType === "image" ||
            attachment.type.startsWith("image/");
        return (React.createElement("div", { key: attachment.publicId || attachment.url }, isImage ? (React.createElement("a", { href: attachment.url, target: "_blank", rel: "noopener noreferrer", className: "block overflow-hidden rounded-lg" },
            React.createElement("img", { src: attachment.url, alt: attachment.name || "Message attachment", className: "max-h-[320px] max-w-full rounded-lg object-contain", loading: "lazy", onError: function (event) {
                    console.error("Unable to load message image:", attachment.url);
                    event.currentTarget.style.display = "none";
                } }))) : (React.createElement("a", { href: attachment.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-3 rounded-lg border border-neutral-200 bg-white/80 p-3 transition hover:bg-neutral-100" },
            React.createElement("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600" },
                React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" })),
            React.createElement("div", { className: "min-w-0 flex-1" },
                React.createElement("p", { className: "truncate text-xs font-medium text-neutral-800" }, attachment.name),
                React.createElement("p", { className: "mt-1 text-[10px] text-neutral-400" },
                    (attachment.size / 1024 / 1024).toFixed(2),
                    " MB")),
            React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4 shrink-0 text-neutral-400" })))));
    })));
}
exports.Conversation = function (_a) {
    var _b;
    var conversation = _a.conversation, messages = _a.messages, _c = _a.loading, loading = _c === void 0 ? false : _c, currentUserId = _a.currentUserId, onSendMessage = _a.onSendMessage;
    return (React.createElement("section", { className: "flex min-w-0 flex-1 flex-col bg-white" },
        React.createElement(ConversationHeader_1.ConversationHeader, { conversation: conversation }),
        React.createElement("div", { className: "min-h-0 flex-1 overflow-y-auto px-5 py-6" },
            React.createElement("div", { className: "mx-auto max-w-[760px]" }, loading ? (React.createElement("div", { className: "flex min-h-[240px] items-center justify-center" },
                React.createElement("div", { className: "text-center" },
                    React.createElement("div", { className: "mx-auto h-4 w-4 animate-spin rounded-full border border-neutral-200 border-t-black" }),
                    React.createElement("p", { className: "mt-3 text-[7px] text-neutral-400" }, "Loading conversation...")))) : messages.length === 0 ? (React.createElement("div", { className: "flex min-h-[240px] items-center justify-center" },
                React.createElement("div", { className: "text-center" },
                    React.createElement("p", { className: "text-[9px] font-medium text-black" }, "No messages yet"),
                    React.createElement("p", { className: "mt-1 text-[7px] text-neutral-400" }, "Start the conversation below.")))) : (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "mb-8 flex items-center gap-3" },
                    React.createElement("div", { className: "h-px flex-1 bg-neutral-100" }),
                    React.createElement("span", { className: "shrink-0 text-[7px] font-medium text-neutral-400" }, ((_b = messages[0]) === null || _b === void 0 ? void 0 : _b.timestamp) ? "Conversation"
                        : ""),
                    React.createElement("div", { className: "h-px flex-1 bg-neutral-100" })),
                React.createElement("div", { className: "space-y-7" }, __spreadArrays(messages).reverse().map(function (message, index) {
                    var isCurrentUser = message.senderId ===
                        currentUserId;
                    return (React.createElement(framer_motion_1.motion.div, { key: message.id, initial: {
                            opacity: 0,
                            y: 6
                        }, animate: {
                            opacity: 1,
                            y: 0
                        }, transition: {
                            duration: 0.3,
                            delay: index * 0.02,
                            ease: [
                                0.22,
                                1,
                                0.36,
                                1,
                            ]
                        }, className: [
                            "flex gap-2.5",
                            isCurrentUser
                                ? "justify-end"
                                : "justify-start",
                        ].join(" ") },
                        !isCurrentUser && (React.createElement("div", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[6px] font-semibold text-white" }, message.senderInitials)),
                        React.createElement("div", { className: [
                                "max-w-[75%]",
                                isCurrentUser
                                    ? "items-end"
                                    : "items-start",
                            ].join(" ") },
                            React.createElement("div", { className: [
                                    "mb-1 flex items-center gap-2",
                                    isCurrentUser
                                        ? "justify-end"
                                        : "justify-start",
                                ].join(" ") },
                                React.createElement("span", { className: "text-[7px] font-semibold text-black" }, message.senderName),
                                React.createElement("span", { className: "text-[6px] text-neutral-400" }, message.timestamp)),
                            React.createElement("div", { className: [
                                    "rounded-[7px] px-3 py-2.5",
                                    isCurrentUser
                                        ? "bg-black text-white"
                                        : "border border-neutral-200 bg-neutral-50 text-neutral-700",
                                ].join(" ") },
                                message.replyTo && (React.createElement("div", { className: [
                                        "mb-2 rounded-[4px] border-l-2 px-2 py-1.5",
                                        isCurrentUser
                                            ? "border-neutral-500 bg-white/10"
                                            : "border-neutral-300 bg-white",
                                    ].join(" ") },
                                    React.createElement("p", { className: "text-[6px] font-semibold opacity-70" }, message.replyTo
                                        .senderName),
                                    React.createElement("p", { className: "mt-0.5 line-clamp-2 text-[6px] opacity-60" }, message.replyTo
                                        .content))),
                                message.content && (React.createElement("p", { className: "whitespace-pre-wrap break-words text-[10px] leading-[1.65]" }, message.content)),
                                message.attachments && message.attachments.length > 0 && (React.createElement(MessageAttachments, { attachments: message.attachments })))),
                        isCurrentUser && (React.createElement("div", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[6px] font-semibold text-neutral-700" }, message.senderInitials))));
                })))))),
        React.createElement(Composer_1.MessageComposer, { onSendMessage: onSendMessage })));
};
