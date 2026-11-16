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
exports.MessageThread = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function getId(value) {
    if (!value)
        return "";
    return typeof value === "string" ? value : value._id;
}
function getPersonName(value) {
    if (typeof value === "string")
        return "Conversation participant";
    var name = [value.fname, value.lname].filter(Boolean).join(" ");
    return name || "Conversation participant";
}
function getInitials(name) {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(function (part) { return part[0]; })
        .join("")
        .toUpperCase();
}
function formatTime(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "";
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}
function formatFileSize(bytes) {
    if (!bytes || bytes <= 0)
        return "0 KB";
    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
function isImageAttachment(attachment) {
    return (attachment.resourceType === "image" ||
        attachment.type.startsWith("image/"));
}
function MessageAttachments(_a) {
    var attachments = _a.attachments, isOwnMessage = _a.isOwnMessage;
    if (!(attachments === null || attachments === void 0 ? void 0 : attachments.length))
        return null;
    return (React.createElement("div", { className: "mt-2 space-y-2" }, attachments.map(function (attachment, index) {
        var isImage = isImageAttachment(attachment);
        return (React.createElement("div", { key: attachment.publicId || attachment.name + "-" + index }, isImage ? (React.createElement("a", { href: attachment.url, target: "_blank", rel: "noopener noreferrer", className: "group block max-w-full overflow-hidden rounded-lg border border-white/10", "aria-label": "View " + attachment.name },
            React.createElement("img", { src: attachment.url, alt: attachment.name, loading: "lazy", className: "max-h-72 max-w-full object-contain transition-opacity group-hover:opacity-90" }),
            React.createElement("div", { className: "flex items-center gap-2 px-2.5 py-2 text-[10px] " + (isOwnMessage
                    ? "bg-white/10 text-neutral-200"
                    : "bg-neutral-100 text-neutral-600") },
                React.createElement("span", { className: "truncate" }, attachment.name),
                React.createElement("span", { className: "shrink-0" }, formatFileSize(attachment.size))))) : (React.createElement("a", { href: attachment.url, target: "_blank", rel: "noopener noreferrer", download: attachment.name, className: "flex min-w-0 items-center gap-3 rounded-lg border p-3 transition " + (isOwnMessage
                ? "border-white/15 bg-white/10 hover:bg-white/15"
                : "border-neutral-200 bg-white hover:bg-neutral-100") },
            React.createElement("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " + (isOwnMessage
                    ? "bg-white/10 text-white"
                    : "bg-neutral-100 text-neutral-600") },
                React.createElement(lucide_react_1.FileText, { size: 17 })),
            React.createElement("div", { className: "min-w-0 flex-1" },
                React.createElement("p", { className: "truncate text-[11px] font-medium" }, attachment.name),
                React.createElement("p", { className: "mt-0.5 text-[10px] " + (isOwnMessage
                        ? "text-neutral-300"
                        : "text-neutral-500") }, formatFileSize(attachment.size))),
            React.createElement(lucide_react_1.Download, { size: 15, className: "shrink-0 opacity-70" })))));
    })));
}
function formatDateDivider(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "";
    var now = new Date();
    var yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === now.toDateString())
        return "Today";
    if (date.toDateString() === yesterday.toDateString())
        return "Yesterday";
    return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: date.getFullYear() === now.getFullYear()
            ? undefined
            : "numeric"
    });
}
function sameDay(a, b) {
    return new Date(a).toDateString() === new Date(b).toDateString();
}
function Avatar(_a) {
    var name = _a.name, image = _a.image, _b = _a.size, size = _b === void 0 ? "sm" : _b;
    var sizeClass = size === "md" ? "h-9 w-9 text-[10px]" : "h-7 w-7 text-[9px]";
    if (image) {
        return (
        // eslint-disable-next-line @next/next/no-img-element
        React.createElement("img", { src: image, alt: "", className: sizeClass + " shrink-0 rounded-full border border-neutral-200 object-cover" }));
    }
    return (React.createElement("div", { className: sizeClass + " flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 font-semibold text-neutral-600", "aria-hidden": "true" }, getInitials(name || "User")));
}
exports.MessageThread = function (_a) {
    var conversation = _a.conversation, messages = _a.messages, currentUserId = _a.currentUserId, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.error, error = _c === void 0 ? null : _c, onBack = _a.onBack, onRetry = _a.onRetry, onOpenDetails = _a.onOpenDetails, onMarkRead = _a.onMarkRead;
    var bottomRef = react_1.useRef(null);
    var orderedMessages = react_1.useMemo(function () {
        return __spreadArrays(messages).sort(function (a, b) {
            return new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime();
        });
    }, [messages]);
    react_1.useEffect(function () {
        var _a;
        (_a = bottomRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }, [orderedMessages.length, conversation === null || conversation === void 0 ? void 0 : conversation.threadId]);
    react_1.useEffect(function () {
        if (!conversation || loading || !onMarkRead)
            return;
        orderedMessages.forEach(function (message) {
            var senderId = getId(message.sender);
            if (senderId !== currentUserId &&
                message.read !== true) {
                onMarkRead(message._id);
            }
        });
    }, [
        conversation === null || conversation === void 0 ? void 0 : conversation.threadId,
        currentUserId,
        loading,
        onMarkRead,
        orderedMessages,
    ]);
    if (!conversation) {
        return (React.createElement("section", { className: "flex h-full min-h-0 flex-col items-center justify-center bg-white px-6 text-center" },
            React.createElement("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50" },
                React.createElement(lucide_react_1.MessageSquare, { size: 20, className: "text-neutral-400", "aria-hidden": "true" })),
            React.createElement("h2", { className: "text-sm font-semibold text-neutral-900" }, "Your project conversations"),
            React.createElement("p", { className: "mt-2 max-w-xs text-xs leading-5 text-neutral-500" }, "Select a conversation to view messages and respond to your client.")));
    }
    var title = conversation.projectTitle || "Project conversation";
    var clientName = conversation.clientName || "Client";
    return (React.createElement("section", { className: "flex h-full min-h-0 flex-col bg-white" },
        React.createElement("header", { className: "flex min-h-[65px] items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5" },
            React.createElement("div", { className: "flex min-w-0 items-center gap-3" },
                onBack && (React.createElement("button", { type: "button", onClick: onBack, "aria-label": "Back to conversations", className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 md:hidden" },
                    React.createElement(lucide_react_1.ArrowLeft, { size: 16 }))),
                React.createElement(Avatar, { name: clientName, image: conversation.clientImage, size: "md" }),
                React.createElement("div", { className: "min-w-0" },
                    React.createElement("h2", { className: "truncate text-xs font-semibold text-neutral-950 sm:text-sm" }, title),
                    React.createElement("div", { className: "mt-1 flex min-w-0 items-center gap-1.5" },
                        React.createElement("span", { className: "h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" }),
                        React.createElement("p", { className: "truncate text-[10px] text-neutral-500 sm:text-[11px]" }, clientName),
                        React.createElement("span", { className: "text-neutral-300" }, "\u00B7"),
                        React.createElement("span", { className: "truncate text-[10px] text-neutral-400" }, "Project conversation")))),
            React.createElement("div", { className: "flex shrink-0 items-center gap-1" },
                onOpenDetails && (React.createElement("button", { type: "button", onClick: onOpenDetails, "aria-label": "View conversation details", title: "Conversation details", className: "flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900" },
                    React.createElement(lucide_react_1.Building2, { size: 15 }))),
                React.createElement("button", { type: "button", "aria-label": "More conversation options", title: "More options", className: "flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900" },
                    React.createElement(lucide_react_1.MoreHorizontal, { size: 17 })))),
        React.createElement("div", { className: "border-b border-neutral-100 bg-neutral-50/60 px-4 py-2.5 sm:px-5" },
            React.createElement("div", { className: "flex items-center gap-2 text-[10px] text-neutral-500" },
                React.createElement(lucide_react_1.Building2, { size: 12, className: "shrink-0" }),
                React.createElement("span", { className: "shrink-0" }, "Project"),
                React.createElement("span", { className: "text-neutral-300" }, "/"),
                React.createElement("span", { className: "truncate font-medium text-neutral-700" }, title))),
        React.createElement("div", { className: "min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6", "aria-label": "Message history", "aria-live": "polite" }, loading ? (React.createElement("div", { className: "space-y-6", "aria-label": "Loading messages" }, [
            { own: false, width: "w-2/3" },
            { own: true, width: "w-1/2" },
            { own: false, width: "w-1/2" },
            { own: true, width: "w-2/3" },
        ].map(function (item, index) { return (React.createElement("div", { key: index, className: "flex animate-pulse items-end gap-2 " + (item.own ? "justify-end" : "justify-start") },
            !item.own && (React.createElement("div", { className: "h-7 w-7 shrink-0 rounded-full bg-neutral-100" })),
            React.createElement("div", { className: item.width + " space-y-2 rounded-xl bg-neutral-100 p-4" },
                React.createElement("div", { className: "h-2.5 w-full rounded bg-neutral-200" }),
                React.createElement("div", { className: "h-2.5 w-3/4 rounded bg-neutral-200" })))); }))) : error ? (React.createElement("div", { className: "flex min-h-64 flex-col items-center justify-center text-center" },
            React.createElement("p", { className: "text-sm font-medium text-neutral-800" }, "Couldn't load this conversation"),
            React.createElement("p", { className: "mt-1 max-w-xs text-xs leading-5 text-neutral-500" }, error),
            onRetry && (React.createElement("button", { type: "button", onClick: onRetry, className: "mt-4 rounded-md bg-neutral-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-700" }, "Try again")))) : orderedMessages.length === 0 ? (React.createElement("div", { className: "flex min-h-64 flex-col items-center justify-center text-center" },
            React.createElement("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50" },
                React.createElement(lucide_react_1.MessageSquare, { size: 17, className: "text-neutral-400", "aria-hidden": "true" })),
            React.createElement("p", { className: "text-sm font-medium text-neutral-800" }, "Start the conversation"),
            React.createElement("p", { className: "mt-1 max-w-xs text-xs leading-5 text-neutral-500" }, "Send a message to discuss updates, feedback, or next steps for this project."))) : (React.createElement("div", { className: "mx-auto flex max-w-3xl flex-col gap-5" },
            orderedMessages.map(function (message, index) {
                var _a;
                var senderId = getId(message.sender);
                var isOwnMessage = senderId === currentUserId;
                var senderName = typeof message.sender === "string"
                    ? isOwnMessage
                        ? "You"
                        : clientName
                    : getPersonName(message.sender);
                var senderImage = typeof message.sender === "string"
                    ? undefined
                    : message.sender.image;
                var showDate = index === 0 ||
                    !sameDay(orderedMessages[index - 1].createdAt, message.createdAt);
                var isRead = message.read === true;
                return (React.createElement("div", { key: message._id, className: "space-y-4" },
                    showDate && (React.createElement("div", { className: "flex items-center gap-3 py-1" },
                        React.createElement("div", { className: "h-px flex-1 bg-neutral-100" }),
                        React.createElement("span", { className: "shrink-0 text-[10px] font-medium text-neutral-400" }, formatDateDivider(message.createdAt)),
                        React.createElement("div", { className: "h-px flex-1 bg-neutral-100" }))),
                    React.createElement("div", { className: "flex items-end gap-2.5 " + (isOwnMessage ? "justify-end" : "justify-start") },
                        !isOwnMessage && (React.createElement(Avatar, { name: senderName, image: senderImage })),
                        React.createElement("div", { className: "flex max-w-[85%] flex-col sm:max-w-[75%] " + (isOwnMessage ? "items-end" : "items-start") },
                            React.createElement("div", { className: "mb-1.5 flex items-center gap-2 px-0.5" },
                                React.createElement("span", { className: "text-[10px] font-medium text-neutral-600" }, senderName),
                                React.createElement("span", { className: "text-[10px] text-neutral-400" }, formatTime(message.createdAt))),
                            React.createElement("div", { className: "max-w-full rounded-2xl px-3.5 py-2.5 text-xs leading-[1.7] sm:px-4 " + (isOwnMessage
                                    ? "rounded-br-md bg-neutral-950 text-white"
                                    : "rounded-bl-md border border-neutral-200 bg-neutral-50 text-neutral-800") },
                                ((_a = message.content) === null || _a === void 0 ? void 0 : _a.trim()) && (React.createElement("p", { className: "whitespace-pre-wrap break-words" }, message.content)),
                                message.attachments && message.attachments.length > 0 && (React.createElement(MessageAttachments, { attachments: message.attachments, isOwnMessage: isOwnMessage }))),
                            isOwnMessage && (React.createElement("div", { className: "mt-1.5 flex items-center gap-1 px-1 text-[9px] text-neutral-400" }, isRead ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.CheckCheck, { size: 12, className: "text-neutral-600" }),
                                React.createElement("span", null, "Read"))) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Check, { size: 12 }),
                                React.createElement("span", null, "Sent")))))),
                        isOwnMessage && (React.createElement("div", { className: "mb-0.5 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[9px] font-semibold text-white sm:flex" }, getInitials("You"))))));
            }),
            React.createElement("div", { ref: bottomRef }))))));
};
