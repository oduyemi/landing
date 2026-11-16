"use client";
"use strict";
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
exports.MessageComposer = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var message_attachments_1 = require("@/utils/message-attachments");
var EMOJIS = [
    "😀", "😃", "😄", "😁", "😊", "🙂", "😉", "😍",
    "🥰", "😘", "😎", "🤔", "😅", "😂", "🤣", "😭",
    "👍", "👎", "👌", "👏", "🙌", "🙏", "🤝", "❤️",
    "💯", "🎉", "🔥", "✨", "💪", "🚀", "✅", "📌",
    "👋", "💡", "💬", "⭐", "🙈", "😇", "🥳", "💙",
];
var ACCEPTED_FILES = "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";
exports.MessageComposer = function (_a) {
    var onSendMessage = _a.onSendMessage, _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.placeholder, placeholder = _c === void 0 ? "Type a message..." : _c, _d = _a.maxLength, maxLength = _d === void 0 ? 5000 : _d;
    var _e = react_1.useState(""), content = _e[0], setContent = _e[1];
    var _f = react_1.useState([]), attachments = _f[0], setAttachments = _f[1];
    var _g = react_1.useState(false), sending = _g[0], setSending = _g[1];
    var _h = react_1.useState(""), error = _h[0], setError = _h[1];
    var _j = react_1.useState(false), emojiOpen = _j[0], setEmojiOpen = _j[1];
    var textareaRef = react_1.useRef(null);
    var fileInputRef = react_1.useRef(null);
    var isDisabled = disabled || sending;
    var remaining = maxLength - content.length;
    var resizeTextarea = react_1.useCallback(function () {
        var textarea = textareaRef.current;
        if (!textarea)
            return;
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 144) + "px";
    }, []);
    var handleChange = function (value) {
        setContent(value);
        if (error) {
            setError("");
        }
    };
    var handleFiles = function (selectedFiles) {
        if (!selectedFiles || selectedFiles.length === 0)
            return;
        var newFiles = Array.from(selectedFiles);
        var combined = __spreadArrays(attachments, newFiles);
        var validationError = message_attachments_1.validateMessageAttachments(combined);
        if (validationError) {
            setError(validationError);
            return;
        }
        setAttachments(combined);
        setError("");
    };
    var removeAttachment = function (index) {
        setAttachments(function (current) {
            return current.filter(function (_, i) { return i !== index; });
        });
        setError("");
    };
    var insertEmoji = function (emoji) {
        var textarea = textareaRef.current;
        if (!textarea) {
            var nextContent_1 = content + emoji;
            if (nextContent_1.length > maxLength) {
                setError("Messages cannot exceed " + maxLength + " characters.");
                return;
            }
            setContent(nextContent_1);
            setEmojiOpen(false);
            return;
        }
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var nextContent = content.slice(0, start) +
            emoji +
            content.slice(end);
        if (nextContent.length > maxLength) {
            setError("Messages cannot exceed " + maxLength + " characters.");
            return;
        }
        setContent(nextContent);
        setEmojiOpen(false);
        setError("");
        requestAnimationFrame(function () {
            textarea.focus();
            var position = start + emoji.length;
            textarea.setSelectionRange(position, position);
            resizeTextarea();
        });
    };
    var submit = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var message, validationError, success, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event === null || event === void 0 ? void 0 : event.preventDefault();
                    if (isDisabled)
                        return [2 /*return*/];
                    message = content.trim();
                    if (!message && attachments.length === 0) {
                        setError("Write a message or attach a file before sending.");
                        return [2 /*return*/];
                    }
                    if (message.length > maxLength) {
                        setError("Messages cannot exceed " + maxLength + " characters.");
                        return [2 /*return*/];
                    }
                    validationError = message_attachments_1.validateMessageAttachments(attachments);
                    if (validationError) {
                        setError(validationError);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setSending(true);
                    setError("");
                    setEmojiOpen(false);
                    return [4 /*yield*/, onSendMessage(message, attachments)];
                case 2:
                    success = _a.sent();
                    if (!success) {
                        setError("Unable to send your message. Please try again.");
                        return [2 /*return*/];
                    }
                    setContent("");
                    setAttachments([]);
                    if (textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                        textareaRef.current.focus();
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error("MESSAGE COMPOSER ERROR:", err_1);
                    setError(err_1 instanceof Error
                        ? err_1.message
                        : "Unable to send your message. Please try again.");
                    return [3 /*break*/, 5];
                case 4:
                    setSending(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleKeyDown = function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void submit();
        }
    };
    return (React.createElement("div", { className: "shrink-0 border-t border-neutral-200 bg-white px-3 py-3 sm:px-5 sm:py-4" },
        React.createElement("form", { onSubmit: submit, className: "mx-auto max-w-[760px]" },
            React.createElement("div", { className: "rounded-xl border bg-white transition " + (error
                    ? "border-red-300 focus-within:border-red-400"
                    : "border-neutral-200 focus-within:border-neutral-400") + " " + (isDisabled ? "opacity-70" : "") },
                attachments.length > 0 && (React.createElement("div", { className: "flex flex-wrap gap-2 px-3 pt-3" }, attachments.map(function (file, index) {
                    var isImage = file.type.startsWith("image/");
                    return (React.createElement("div", { key: file.name + "-" + file.size + "-" + index, className: "flex max-w-full items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2" },
                        isImage ? (React.createElement(lucide_react_1.Image, { size: 15, className: "shrink-0 text-neutral-500" })) : (React.createElement(lucide_react_1.FileText, { size: 15, className: "shrink-0 text-neutral-500" })),
                        React.createElement("div", { className: "min-w-0" },
                            React.createElement("p", { className: "max-w-40 truncate text-[11px] font-medium text-neutral-700" }, file.name),
                            React.createElement("p", { className: "text-[10px] text-neutral-400" },
                                (file.size / 1024 / 1024).toFixed(2),
                                " MB")),
                        React.createElement("button", { type: "button", disabled: isDisabled, onClick: function () { return removeAttachment(index); }, "aria-label": "Remove " + file.name, className: "ml-1 rounded p-1 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-50" },
                            React.createElement(lucide_react_1.X, { size: 13 }))));
                }))),
                React.createElement("textarea", { ref: textareaRef, value: content, onChange: function (event) {
                        handleChange(event.target.value);
                        resizeTextarea();
                    }, onKeyDown: handleKeyDown, placeholder: disabled
                        ? "Select a conversation to reply..."
                        : placeholder, disabled: isDisabled, rows: 1, maxLength: maxLength, "aria-label": "Write a message", "aria-invalid": Boolean(error), className: "block max-h-36 min-h-[46px] w-full resize-none bg-transparent px-4 pb-2 pt-3 text-xs leading-5 text-neutral-800 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed" }),
                React.createElement("div", { className: "flex items-center justify-between gap-3 px-3 pb-2.5" },
                    React.createElement("div", { className: "flex min-w-0 items-center gap-1" },
                        React.createElement("input", { ref: fileInputRef, type: "file", multiple: true, accept: ACCEPTED_FILES, className: "hidden", onChange: function (event) {
                                handleFiles(event.target.files);
                                event.currentTarget.value = "";
                            } }),
                        React.createElement("button", { type: "button", disabled: isDisabled ||
                                attachments.length >= message_attachments_1.MAX_MESSAGE_ATTACHMENTS, onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, title: "Attach files (max " + message_attachments_1.MAX_MESSAGE_ATTACHMENTS + ", " + message_attachments_1.MAX_MESSAGE_ATTACHMENT_SIZE / 1024 / 1024 + " MB each)", "aria-label": "Attach files", className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:text-neutral-300" },
                            React.createElement(lucide_react_1.Paperclip, { size: 15 })),
                        React.createElement("div", { className: "relative" },
                            React.createElement("button", { type: "button", disabled: isDisabled, onClick: function () {
                                    return setEmojiOpen(function (current) { return !current; });
                                }, title: "Insert emoji", "aria-label": "Insert emoji", "aria-expanded": emojiOpen, className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:text-neutral-300" },
                                React.createElement(lucide_react_1.Smile, { size: 15 })),
                            emojiOpen && (React.createElement("div", { className: "absolute bottom-9 left-0 z-30 grid w-64 grid-cols-8 gap-1 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl" }, EMOJIS.map(function (emoji) { return (React.createElement("button", { key: emoji, type: "button", onClick: function () { return insertEmoji(emoji); }, "aria-label": "Insert " + emoji, className: "flex h-7 w-7 items-center justify-center rounded-md text-base transition hover:bg-neutral-100" }, emoji)); })))),
                        React.createElement("span", { className: "ml-1 hidden text-[10px] text-neutral-400 sm:inline" }, "Enter to send \u00B7 Shift + Enter for a new line")),
                    React.createElement("div", { className: "flex shrink-0 items-center gap-3" },
                        React.createElement("span", { className: "hidden text-[10px] tabular-nums sm:inline " + (remaining < 100
                                ? "text-neutral-600"
                                : "text-neutral-400") },
                            content.length,
                            "/",
                            maxLength),
                        React.createElement("button", { type: "submit", disabled: isDisabled ||
                                (!content.trim() && attachments.length === 0), "aria-label": "Send message", className: "inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-[11px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400" }, sending ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Loader2, { size: 13, className: "animate-spin" }),
                            React.createElement("span", null, "Sending"))) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.ArrowUp, { size: 13 }),
                            React.createElement("span", null, "Send"))))))),
            error && (React.createElement("p", { role: "alert", className: "mt-2 flex items-center gap-1.5 text-[11px] text-red-600" },
                React.createElement(lucide_react_1.AlertCircle, { size: 13, className: "shrink-0" }),
                error)))));
};
