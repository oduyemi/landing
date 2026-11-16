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
                                React.createElement("p", { className: "text-[10px] leading-[1.65]" }, message.content))),
                        isCurrentUser && (React.createElement("div", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[6px] font-semibold text-neutral-700" }, message.senderInitials))));
                })))))),
        React.createElement(Composer_1.MessageComposer, { onSendMessage: onSendMessage })));
};
