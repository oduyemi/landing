"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.MessagesDashboard = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ConversationList_1 = require("./ConversationList");
var Conversation_1 = require("./Conversation");
var StartMessaging_1 = require("./StartMessaging");
// ======================================================
// HELPERS
// ======================================================
var getInitials = function (fname, lname) {
    var _a, _b;
    var first = (_a = fname === null || fname === void 0 ? void 0 : fname.trim().charAt(0)) !== null && _a !== void 0 ? _a : "";
    var last = (_b = lname === null || lname === void 0 ? void 0 : lname.trim().charAt(0)) !== null && _b !== void 0 ? _b : "";
    return ("" + first + last).toUpperCase() || "?";
};
var formatMessageTime = function (dateString) {
    var date = new Date(dateString);
    if (Number.isNaN(date.getTime()))
        return "";
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
};
var formatConversationTime = function (dateString) {
    var date = new Date(dateString);
    if (Number.isNaN(date.getTime()))
        return "";
    var now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return formatMessageTime(dateString);
    }
    var yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }
    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric"
    });
};
var normalizeConversation = function (conversation) {
    var _a, _b, _c, _d;
    var participant = conversation.participant;
    var lastMessage = conversation.lastMessage;
    var task = (_a = lastMessage.task) !== null && _a !== void 0 ? _a : null;
    return {
        id: conversation.project._id + "-" + conversation.threadId,
        threadId: conversation.threadId,
        projectId: conversation.project._id,
        projectName: conversation.project.title,
        projectType: (_b = conversation.project.type) !== null && _b !== void 0 ? _b : "Project",
        taskId: task === null || task === void 0 ? void 0 : task._id,
        taskTitle: task === null || task === void 0 ? void 0 : task.title,
        participant: participant,
        participantRole: participant.role === "admin" ? "Admin" : "Client",
        participantInitials: getInitials(participant.fname, participant.lname),
        lastMessage: ((_c = lastMessage.content) === null || _c === void 0 ? void 0 : _c.trim()) ||
            (((_d = lastMessage.attachments) === null || _d === void 0 ? void 0 : _d.length) ? "\uD83D\uDCCE " + lastMessage.attachments.length + " attachment" + (lastMessage.attachments.length === 1 ? "" : "s")
                : "No message content"),
        lastMessageTime: formatConversationTime(lastMessage.createdAt),
        unread: conversation.unreadCount > 0,
        unreadCount: conversation.unreadCount
    };
};
var normalizeMessage = function (message) {
    var _a, _b, _c, _d;
    var sender = message.sender;
    return {
        id: message._id,
        senderId: sender._id,
        recipientId: message.recipient._id,
        sender: sender.role === "admin" ? "admin" : "client",
        senderName: (sender.fname + " " + sender.lname).trim(),
        senderInitials: getInitials(sender.fname, sender.lname),
        content: (_a = message.content) !== null && _a !== void 0 ? _a : "",
        attachments: (_b = message.attachments) !== null && _b !== void 0 ? _b : [],
        timestamp: formatMessageTime(message.createdAt),
        read: message.read,
        readAt: message.readAt,
        taskId: (_c = message.task) === null || _c === void 0 ? void 0 : _c._id,
        taskTitle: (_d = message.task) === null || _d === void 0 ? void 0 : _d.title,
        replyTo: message.replyTo
            ? {
                id: message.replyTo._id,
                senderName: (message.replyTo.sender.fname + " " + message.replyTo.sender.lname).trim(),
                content: message.replyTo.content,
                createdAt: message.replyTo.createdAt
            }
            : null
    };
};
// ======================================================
// LOADING SKELETON
// ======================================================
function MessagesSkeleton() {
    return (React.createElement("div", { className: "min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6 lg:p-8" },
        React.createElement("div", { className: "mx-auto max-w-[1600px]" },
            React.createElement("div", { className: "animate-pulse" },
                React.createElement("div", { className: "h-3 w-24 rounded bg-[#e3e8f0]" }),
                React.createElement("div", { className: "mt-4 h-9 w-52 rounded-lg bg-[#e3e8f0]" }),
                React.createElement("div", { className: "mt-3 h-4 w-80 max-w-full rounded bg-[#e9edf3]" })),
            React.createElement("div", { className: "mt-7 grid min-h-[600px] overflow-hidden rounded-2xl border border-[#e3e8f0] bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]" },
                React.createElement("div", { className: "hidden border-r border-[#e8ecf2] p-5 lg:block" },
                    React.createElement("div", { className: "h-11 animate-pulse rounded-xl bg-[#f0f3f7]" }),
                    Array.from({ length: 6 }).map(function (_, index) { return (React.createElement("div", { key: index, className: "mt-6 flex animate-pulse gap-3" },
                        React.createElement("div", { className: "h-11 w-11 rounded-full bg-[#e9edf3]" }),
                        React.createElement("div", { className: "flex-1 pt-1" },
                            React.createElement("div", { className: "h-3 w-2/3 rounded bg-[#e9edf3]" }),
                            React.createElement("div", { className: "mt-3 h-3 w-full rounded bg-[#f0f3f7]" })))); })),
                React.createElement("div", { className: "flex min-h-[500px] items-center justify-center" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2fa] text-[#28456f]" },
                            React.createElement(lucide_react_1.LoaderCircle, { className: "h-6 w-6 animate-spin" })),
                        React.createElement("p", { className: "mt-4 text-sm font-semibold text-[#253249]" }, "Preparing your inbox"),
                        React.createElement("p", { className: "mt-1 text-xs text-[#8994a6]" }, "Loading your project conversations...")))))));
}
// ======================================================
// ERROR STATE
// ======================================================
function InboxError(_a) {
    var error = _a.error, onRetry = _a.onRetry;
    return (React.createElement("div", { className: "min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6 lg:p-8" },
        React.createElement("div", { className: "mx-auto flex min-h-[540px] max-w-[1600px] items-center justify-center rounded-2xl border border-[#e3e8f0] bg-white p-6 shadow-sm" },
            React.createElement("div", { className: "max-w-md text-center" },
                React.createElement("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f4dedb] bg-[#fff5f3] text-[#b9382b]" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-7 w-7" })),
                React.createElement("h2", { className: "mt-6 text-lg font-semibold tracking-tight text-[#202d42]" }, "We couldn't load your inbox"),
                React.createElement("p", { className: "mt-2 text-sm leading-6 text-[#778297]" }, error),
                React.createElement("button", { type: "button", onClick: onRetry, className: "mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172b4d] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#223c65] active:scale-[0.98]" },
                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4" }),
                    "Try again")))));
}
// ======================================================
// EMPTY INBOX
// ======================================================
function EmptyInbox(_a) {
    var onStarted = _a.onStarted;
    return (React.createElement("div", { className: "min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-3 sm:p-6 lg:p-8" },
        React.createElement("div", { className: "mx-auto max-w-[1600px]" },
            React.createElement(PageHeading, { unreadCount: 0, conversationCount: 0 }),
            React.createElement("div", { className: "relative mt-7 flex min-h-[560px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#e3e8f0] bg-white px-6 py-16 text-center shadow-[0_5px_25px_rgba(23,43,77,0.035)]" },
                React.createElement("div", { className: "pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#edf3fc] opacity-70 blur-3xl" }),
                React.createElement("div", { className: "pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#f2f5fa] opacity-80 blur-3xl" }),
                React.createElement("div", { className: "relative" },
                    React.createElement("div", { className: "relative flex h-[82px] w-[82px] items-center justify-center rounded-[26px] border border-[#e2eaf5] bg-gradient-to-br from-[#f4f7fc] to-[#e9eff9] text-[#28456f] shadow-sm" },
                        React.createElement(lucide_react_1.MessageSquareText, { className: "h-9 w-9" }),
                        React.createElement("span", { className: "absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-[4px] border-white bg-[#28456f] text-white" },
                            React.createElement(lucide_react_1.Plus, { className: "h-3.5 w-3.5" }))),
                    React.createElement("div", { className: "mt-7" },
                        React.createElement("span", { className: "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8190a7]" }, "Your workspace"),
                        React.createElement("h2", { className: "mt-3 text-2xl font-semibold tracking-[-0.045em] text-[#202d42] sm:text-3xl" }, "Your inbox starts here"),
                        React.createElement("p", { className: "mx-auto mt-3 max-w-md text-sm leading-7 text-[#778297]" }, "Connect with your project team to discuss progress, share files, ask questions, and keep important decisions in one place.")),
                    React.createElement("div", { className: "mt-7" },
                        React.createElement(StartMessaging_1.StartMessaging, { onStarted: onStarted })),
                    React.createElement("div", { className: "mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 border-t border-[#edf0f4] pt-7" },
                        React.createElement("span", { className: "flex items-center gap-2 text-xs text-[#778297]" },
                            React.createElement(lucide_react_1.ShieldCheck, { className: "h-4 w-4 text-[#536d91]" }),
                            "Project-focused conversations"),
                        React.createElement("span", { className: "flex items-center gap-2 text-xs text-[#778297]" },
                            React.createElement(lucide_react_1.Users, { className: "h-4 w-4 text-[#536d91]" }),
                            "Direct team communication")))))));
}
// ======================================================
// PAGE HEADING
// ======================================================
function PageHeading(_a) {
    var unreadCount = _a.unreadCount, conversationCount = _a.conversationCount;
    return (React.createElement("header", { className: "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between" },
        React.createElement("div", { className: "min-w-0" },
            React.createElement("div", { className: "flex items-center gap-2 text-[11px] font-medium text-[#8792a5]" },
                React.createElement("span", null, "Workspace"),
                React.createElement(lucide_react_1.ChevronRight, { className: "h-3 w-3" }),
                React.createElement("span", { className: "text-[#35435a]" }, "Messages")),
            React.createElement("div", { className: "mt-3 flex flex-wrap items-center gap-3" },
                React.createElement("h1", { className: "text-[27px] font-semibold tracking-[-0.055em] text-[#172033] sm:text-[32px]" }, "Messages"),
                unreadCount > 0 && (React.createElement("span", { className: "inline-flex h-7 items-center gap-2 rounded-full border border-[#d8e5f7] bg-[#edf4ff] px-3 text-[11px] font-semibold text-[#315b92]" },
                    React.createElement("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-[#4778b9]" }),
                    unreadCount,
                    " unread"))),
            React.createElement("p", { className: "mt-2 max-w-xl text-[13px] leading-6 text-[#778297]" }, "Stay connected with your project team and keep every discussion organized.")),
        React.createElement("div", { className: "flex items-center gap-3 self-start rounded-xl border border-[#e3e8f0] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(20,35,60,0.025)] sm:self-auto" },
            React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2fa] text-[#28456f]" },
                React.createElement(lucide_react_1.MessageSquareText, { className: "h-[19px] w-[19px]" })),
            React.createElement("div", null,
                React.createElement("p", { className: "text-lg font-semibold leading-5 tabular-nums text-[#202d42]" }, conversationCount),
                React.createElement("p", { className: "mt-1 text-[10px] font-medium text-[#8994a6]" }, "Active conversations")),
            React.createElement("div", { className: "ml-2 h-8 w-px bg-[#edf0f4]" }),
            React.createElement("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg text-[#8792a5]" },
                React.createElement(lucide_react_1.ArrowUpRight, { className: "h-4 w-4" })))));
}
// ======================================================
// MESSAGES DASHBOARD
// ======================================================
exports.MessagesDashboard = function () {
    var _a = react_1.useState(null), currentUser = _a[0], setCurrentUser = _a[1];
    var _b = react_1.useState([]), conversations = _b[0], setConversations = _b[1];
    var _c = react_1.useState(null), selectedConversationId = _c[0], setSelectedConversationId = _c[1];
    var _d = react_1.useState([]), messages = _d[0], setMessages = _d[1];
    var _e = react_1.useState(true), loadingConversations = _e[0], setLoadingConversations = _e[1];
    var _f = react_1.useState(false), loadingMessages = _f[0], setLoadingMessages = _f[1];
    var _g = react_1.useState(null), error = _g[0], setError = _g[1];
    var _h = react_1.useState(null), messageError = _h[0], setMessageError = _h[1];
    var _j = react_1.useState(true), showSidebar = _j[0], setShowSidebar = _j[1];
    // ====================================================
    // DERIVED STATE
    // ====================================================
    var selectedConversation = react_1.useMemo(function () { var _a; return (_a = conversations.find(function (conversation) {
        return conversation.id === selectedConversationId;
    })) !== null && _a !== void 0 ? _a : null; }, [conversations, selectedConversationId]);
    var unreadCount = react_1.useMemo(function () {
        return conversations.reduce(function (total, conversation) {
            return total + conversation.unreadCount;
        }, 0);
    }, [conversations]);
    // ====================================================
    // FETCH CURRENT USER
    // ====================================================
    var fetchCurrentUser = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, user, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/auth/me", {
                            method: "GET",
                            credentials: "include",
                            cache: "no-store"
                        })];
                case 1:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("Unable to authenticate.");
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    user = (_a = data.user) !== null && _a !== void 0 ? _a : null;
                    setCurrentUser(user);
                    return [2 /*return*/, user];
                case 3:
                    error_1 = _b.sent();
                    console.error("FETCH CURRENT USER ERROR:", error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    // ====================================================
    // FETCH CONVERSATIONS
    // ====================================================
    var fetchConversations = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, normalized_1, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    setLoadingConversations(true);
                    setError(null);
                    return [4 /*yield*/, fetch("/api/messages/conversations", {
                            method: "GET",
                            credentials: "include",
                            cache: "no-store"
                        })];
                case 1:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    if (!response.ok) {
                        throw new Error(data.error || "Unable to load conversations.");
                    }
                    normalized_1 = ((_a = data.conversations) !== null && _a !== void 0 ? _a : []).map(normalizeConversation);
                    setConversations(normalized_1);
                    setSelectedConversationId(function (current) {
                        var _a, _b;
                        if (current &&
                            normalized_1.some(function (conversation) { return conversation.id === current; })) {
                            return current;
                        }
                        return (_b = (_a = normalized_1[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
                    });
                    return [2 /*return*/, normalized_1];
                case 3:
                    error_2 = _b.sent();
                    console.error("FETCH CONVERSATIONS ERROR:", error_2);
                    setError(error_2 instanceof Error
                        ? error_2.message
                        : "Unable to load conversations.");
                    return [2 /*return*/, []];
                case 4:
                    setLoadingConversations(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    // ====================================================
    // INITIALIZE DASHBOARD
    // ====================================================
    react_1.useEffect(function () {
        var mounted = true;
        var initialize = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Load the authenticated user first so unread
                    // messages can be correctly identified.
                    return [4 /*yield*/, fetchCurrentUser()];
                    case 1:
                        // Load the authenticated user first so unread
                        // messages can be correctly identified.
                        _a.sent();
                        if (!mounted)
                            return [2 /*return*/];
                        return [4 /*yield*/, fetchConversations()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        void initialize();
        return function () {
            mounted = false;
        };
    }, [fetchCurrentUser, fetchConversations]);
    // ====================================================
    // START NEW CONVERSATION
    // ====================================================
    var handleMessageStarted = react_1.useCallback(function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!((_a = message === null || message === void 0 ? void 0 : message.project) === null || _a === void 0 ? void 0 : _a._id) || !(message === null || message === void 0 ? void 0 : message.threadId)) {
                        return [2 /*return*/];
                    }
                    conversationId = message.project._id + "-" + message.threadId;
                    return [4 /*yield*/, fetchConversations()];
                case 1:
                    _b.sent();
                    setSelectedConversationId(conversationId);
                    setShowSidebar(false);
                    return [2 /*return*/];
            }
        });
    }); }, [fetchConversations]);
    // ====================================================
    // FETCH THREAD MESSAGES
    // ====================================================
    var fetchMessages = react_1.useCallback(function (conversation) { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, data, normalized, hasUnread, readResponse, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    setLoadingMessages(true);
                    setMessageError(null);
                    params = new URLSearchParams({
                        projectId: conversation.projectId,
                        threadId: conversation.threadId,
                        limit: "100"
                    });
                    return [4 /*yield*/, fetch("/api/messages/thread?" + params.toString(), {
                            method: "GET",
                            credentials: "include",
                            cache: "no-store"
                        })];
                case 1:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    if (!response.ok) {
                        throw new Error(data.error || "Unable to load messages.");
                    }
                    normalized = ((_a = data.messages) !== null && _a !== void 0 ? _a : [])
                        .map(normalizeMessage)
                        .reverse();
                    setMessages(normalized);
                    hasUnread = normalized.some(function (message) {
                        return message.recipientId === (currentUser === null || currentUser === void 0 ? void 0 : currentUser._id) &&
                            !message.read;
                    });
                    if (!hasUnread) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("/api/messages/thread/" + encodeURIComponent(conversation.threadId) + "/read", {
                            method: "PATCH",
                            credentials: "include"
                        })];
                case 3:
                    readResponse = _b.sent();
                    if (readResponse.ok) {
                        setConversations(function (previous) {
                            return previous.map(function (item) {
                                return item.id === conversation.id
                                    ? __assign(__assign({}, item), { unread: false, unreadCount: 0 }) : item;
                            });
                        });
                    }
                    _b.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_3 = _b.sent();
                    console.error("FETCH THREAD MESSAGES ERROR:", error_3);
                    setMessages([]);
                    setMessageError(error_3 instanceof Error
                        ? error_3.message
                        : "Unable to load this conversation.");
                    return [3 /*break*/, 7];
                case 6:
                    setLoadingMessages(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [currentUser === null || currentUser === void 0 ? void 0 : currentUser._id]);
    // ====================================================
    // SELECTED CONVERSATION EFFECT
    // ====================================================
    react_1.useEffect(function () {
        if (!selectedConversation) {
            setMessages([]);
            setMessageError(null);
            setLoadingMessages(false);
            return;
        }
        void fetchMessages(selectedConversation);
    }, [selectedConversation, fetchMessages]);
    // ====================================================
    // SELECT CONVERSATION
    // ====================================================
    var handleSelectConversation = react_1.useCallback(function (id) {
        setSelectedConversationId(id);
        setShowSidebar(false);
        setMessageError(null);
    }, []);
    // ====================================================
    // SEND MESSAGE
    // ====================================================
    var handleSendMessage = react_1.useCallback(function (content, attachments, replyTo) {
        if (attachments === void 0) { attachments = []; }
        return __awaiter(void 0, void 0, void 0, function () {
            var formData_1, response, data, normalized_2, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedConversation ||
                            (!content.trim() && attachments.length === 0)) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        setMessageError(null);
                        formData_1 = new FormData();
                        formData_1.append("projectId", selectedConversation.projectId);
                        formData_1.append("recipientId", selectedConversation.participant._id);
                        formData_1.append("content", content.trim());
                        formData_1.append("threadId", selectedConversation.threadId);
                        if (selectedConversation.taskId) {
                            formData_1.append("taskId", selectedConversation.taskId);
                        }
                        if (replyTo) {
                            formData_1.append("replyTo", replyTo);
                        }
                        attachments.forEach(function (file) {
                            formData_1.append("attachments", file);
                        });
                        return [4 /*yield*/, fetch("/api/messages", {
                                method: "POST",
                                credentials: "include",
                                body: formData_1
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        if (!response.ok) {
                            throw new Error(data.error || "Unable to send message.");
                        }
                        if (data.message) {
                            normalized_2 = normalizeMessage(data.message);
                            setMessages(function (previous) { return __spreadArrays(previous, [
                                normalized_2,
                            ]); });
                        }
                        return [4 /*yield*/, fetchConversations()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5:
                        error_4 = _a.sent();
                        console.error("SEND MESSAGE ERROR:", error_4);
                        setMessageError(error_4 instanceof Error
                            ? error_4.message
                            : "Unable to send your message.");
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, [selectedConversation, fetchConversations]);
    // ====================================================
    // LOADING
    // ====================================================
    if (loadingConversations) {
        return React.createElement(MessagesSkeleton, null);
    }
    // ====================================================
    // ERROR
    // ====================================================
    if (error) {
        return (React.createElement(InboxError, { error: error, onRetry: function () { return void fetchConversations(); } }));
    }
    // ====================================================
    // EMPTY INBOX
    // ====================================================
    if (!conversations.length) {
        return (React.createElement(EmptyInbox, { onStarted: handleMessageStarted }));
    }
    // ====================================================
    // MAIN DASHBOARD
    // ====================================================
    return (React.createElement("div", { className: "min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-3 sm:p-5 lg:p-8" },
        React.createElement("div", { className: "mx-auto max-w-[1600px]" },
            React.createElement(PageHeading, { unreadCount: unreadCount, conversationCount: conversations.length }),
            React.createElement("div", { className: "mt-6 grid min-h-[620px] overflow-hidden rounded-2xl border border-[#e1e6ee] bg-white shadow-[0_5px_30px_rgba(23,43,77,0.045)] lg:min-h-[calc(100vh-270px)] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]" },
                React.createElement("aside", { className: [
                        "min-h-[560px] min-w-0 flex-col border-r border-[#e8ecf2] bg-white",
                        showSidebar ? "flex" : "hidden",
                        "lg:flex",
                    ].join(" ") },
                    React.createElement("div", { className: "flex items-center justify-between border-b border-[#edf0f4] px-5 py-[19px]" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("h2", { className: "text-[13px] font-semibold tracking-tight text-[#253249]" }, "Conversations"),
                                React.createElement("span", { className: "h-1.5 w-1.5 rounded-full bg-[#36a477]" })),
                            React.createElement("p", { className: "mt-1 text-[11px] text-[#8994a6]" }, "Your project discussions")),
                        React.createElement("span", { className: "flex h-7 min-w-7 items-center justify-center rounded-lg border border-[#e4eaf2] bg-[#f4f7fb] px-2 text-[11px] font-semibold tabular-nums text-[#28456f]" }, conversations.length)),
                    React.createElement("div", { className: "min-h-0 flex-1" },
                        React.createElement(ConversationList_1.ConversationList, { conversations: conversations, selectedConversationId: selectedConversationId !== null && selectedConversationId !== void 0 ? selectedConversationId : "", onSelect: function (conversation) {
                                return handleSelectConversation(conversation.id);
                            }, onMessageStarted: handleMessageStarted }))),
                React.createElement("main", { className: [
                        "min-h-[560px] min-w-0 bg-white",
                        showSidebar ? "hidden" : "flex flex-col",
                        "lg:flex",
                    ].join(" ") }, selectedConversation ? (React.createElement("div", { className: "flex h-full min-h-[560px] min-w-0 flex-1 flex-col" },
                    React.createElement("div", { className: "flex items-center justify-between border-b border-[#edf0f4] px-4 py-3 lg:hidden" },
                        React.createElement("button", { type: "button", onClick: function () { return setShowSidebar(true); }, className: "inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-[#536176] transition hover:bg-[#f1f4f8]" },
                            React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 rotate-180" }),
                            "All conversations"),
                        React.createElement("span", { className: "text-[10px] font-medium text-[#8994a6]" },
                            conversations.length,
                            " discussions")),
                    messageError && (React.createElement("div", { role: "alert", className: "mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[#f0d0cc] bg-[#fff7f6] p-3.5 text-xs text-[#a52b20] sm:mx-6" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0" }),
                        React.createElement("span", { className: "flex-1 leading-5" }, messageError),
                        React.createElement("button", { type: "button", onClick: function () { return setMessageError(null); }, "aria-label": "Dismiss error", className: "shrink-0 rounded-md p-1 transition hover:bg-[#fce9e6]" },
                            React.createElement(lucide_react_1.X, { className: "h-4 w-4" })))),
                    React.createElement("div", { className: "min-h-0 flex-1" },
                        React.createElement(Conversation_1.Conversation, { conversation: selectedConversation, messages: messages, loading: loadingMessages, currentUserId: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id, onSendMessage: handleSendMessage })))) : (React.createElement("div", { className: "flex min-h-[560px] flex-1 flex-col items-center justify-center px-6 text-center" },
                    React.createElement("div", { className: "flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e3eaf3] bg-[#f2f5fa] text-[#536d91]" },
                        React.createElement(lucide_react_1.Inbox, { className: "h-7 w-7" })),
                    React.createElement("h2", { className: "mt-5 text-base font-semibold tracking-tight text-[#29364c]" }, "Select a conversation"),
                    React.createElement("p", { className: "mt-2 max-w-xs text-xs leading-6 text-[#8792a5]" }, "Choose a conversation to view messages and continue your discussion."))))),
            React.createElement("footer", { className: "mt-5 flex flex-wrap items-center justify-between gap-3 px-1 pb-2" },
                React.createElement("span", { className: "flex items-center gap-2 text-[11px] text-[#8994a6]" },
                    React.createElement(lucide_react_1.ShieldCheck, { className: "h-3.5 w-3.5 text-[#71839e]" }),
                    "Your project conversations in one place"),
                React.createElement("span", { className: "flex items-center gap-2 text-[11px] text-[#8994a6]" },
                    React.createElement(lucide_react_1.CheckCheck, { className: [
                            "h-3.5 w-3.5",
                            unreadCount > 0
                                ? "text-[#4778b9]"
                                : "text-[#36a477]",
                        ].join(" ") }),
                    unreadCount > 0
                        ? unreadCount + " unread " + (unreadCount === 1
                            ? "message"
                            : "messages")
                        : "You're all caught up")))));
};
