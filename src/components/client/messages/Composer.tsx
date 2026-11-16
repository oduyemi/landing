"use client";
import { useCallback, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, AlertCircle, FileText, Image as ImageIcon, Loader2, Paperclip, Smile, X } from "lucide-react";
import { MAX_MESSAGE_ATTACHMENTS, MAX_MESSAGE_ATTACHMENT_SIZE, validateMessageAttachments } from "@/utils/message-attachments";


interface MessageComposerProps {
  onSendMessage: (
    content: string,
    attachments?: File[],
    replyTo?: string
  ) => Promise<boolean>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😊", "🙂", "😉", "😍",
  "🥰", "😘", "😎", "🤔", "😅", "😂", "🤣", "😭",
  "👍", "👎", "👌", "👏", "🙌", "🙏", "🤝", "❤️",
  "💯", "🎉", "🔥", "✨", "💪", "🚀", "✅", "📌",
  "👋", "💡", "💬", "⭐", "🙈", "😇", "🥳", "💙",
];

const ACCEPTED_FILES =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

export const MessageComposer = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 5000,
}: MessageComposerProps) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || sending;
  const remaining = maxLength - content.length;

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      144
    )}px`;
  }, []);

  const handleChange = (value: string) => {
    setContent(value);

    if (error) {
      setError("");
    }
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles);
    const combined = [...attachments, ...newFiles];

    const validationError = validateMessageAttachments(combined);

    if (validationError) {
      setError(validationError);
      return;
    }

    setAttachments(combined);
    setError("");
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) =>
      current.filter((_, i) => i !== index)
    );

    setError("");
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      const nextContent = content + emoji;

      if (nextContent.length > maxLength) {
        setError(
          `Messages cannot exceed ${maxLength} characters.`
        );
        return;
      }

      setContent(nextContent);
      setEmojiOpen(false);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const nextContent =
      content.slice(0, start) +
      emoji +
      content.slice(end);

    if (nextContent.length > maxLength) {
      setError(
        `Messages cannot exceed ${maxLength} characters.`
      );
      return;
    }

    setContent(nextContent);
    setEmojiOpen(false);
    setError("");

    requestAnimationFrame(() => {
      textarea.focus();

      const position = start + emoji.length;

      textarea.setSelectionRange(position, position);
      resizeTextarea();
    });
  };

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (isDisabled) return;

    const message = content.trim();

    if (!message && attachments.length === 0) {
      setError("Write a message or attach a file before sending.");
      return;
    }

    if (message.length > maxLength) {
      setError(
        `Messages cannot exceed ${maxLength} characters.`
      );
      return;
    }

    const validationError =
      validateMessageAttachments(attachments);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSending(true);
      setError("");
      setEmojiOpen(false);

      const success = await onSendMessage(
        message,
        attachments
      );

      if (!success) {
        setError("Unable to send your message. Please try again.");
        return;
      }

      setContent("");
      setAttachments([]);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error("MESSAGE COMPOSER ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className="shrink-0 border-t border-neutral-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
      <form
        onSubmit={submit}
        className="mx-auto max-w-[760px]"
      >
        <div
          className={`rounded-xl border bg-white transition ${
            error
              ? "border-red-300 focus-within:border-red-400"
              : "border-neutral-200 focus-within:border-neutral-400"
          } ${isDisabled ? "opacity-70" : ""}`}
        >
          {/* Selected attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-3">
              {attachments.map((file, index) => {
                const isImage = file.type.startsWith("image/");

                return (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex max-w-full items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2"
                  >
                    {isImage ? (
                      <ImageIcon
                        size={15}
                        className="shrink-0 text-neutral-500"
                      />
                    ) : (
                      <FileText
                        size={15}
                        className="shrink-0 text-neutral-500"
                      />
                    )}

                    <div className="min-w-0">
                      <p className="max-w-40 truncate text-[11px] font-medium text-neutral-700">
                        {file.name}
                      </p>

                      <p className="text-[10px] text-neutral-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => removeAttachment(index)}
                      aria-label={`Remove ${file.name}`}
                      className="ml-1 rounded p-1 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-50"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Message input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => {
              handleChange(event.target.value);
              resizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Select a conversation to reply..."
                : placeholder
            }
            disabled={isDisabled}
            rows={1}
            maxLength={maxLength}
            aria-label="Write a message"
            aria-invalid={Boolean(error)}
            className="block max-h-36 min-h-[46px] w-full resize-none bg-transparent px-4 pb-2 pt-3 text-xs leading-5 text-neutral-800 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-3 pb-2.5">
            <div className="flex min-w-0 items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_FILES}
                className="hidden"
                onChange={(event) => {
                  handleFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
              />

              {/* Attachment button */}
              <button
                type="button"
                disabled={
                  isDisabled ||
                  attachments.length >= MAX_MESSAGE_ATTACHMENTS
                }
                onClick={() => fileInputRef.current?.click()}
                title={`Attach files (max ${MAX_MESSAGE_ATTACHMENTS}, ${MAX_MESSAGE_ATTACHMENT_SIZE / 1024 / 1024} MB each)`}
                aria-label="Attach files"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:text-neutral-300"
              >
                <Paperclip size={15} />
              </button>

              {/* Emoji picker */}
              <div className="relative">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() =>
                    setEmojiOpen((current) => !current)
                  }
                  title="Insert emoji"
                  aria-label="Insert emoji"
                  aria-expanded={emojiOpen}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:text-neutral-300"
                >
                  <Smile size={15} />
                </button>

                {emojiOpen && (
                  <div className="absolute bottom-9 left-0 z-30 grid w-64 grid-cols-8 gap-1 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        aria-label={`Insert ${emoji}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-base transition hover:bg-neutral-100"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="ml-1 hidden text-[10px] text-neutral-400 sm:inline">
                Enter to send · Shift + Enter for a new line
              </span>
            </div>

            {/* Character count and send */}
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={`hidden text-[10px] tabular-nums sm:inline ${
                  remaining < 100
                    ? "text-neutral-600"
                    : "text-neutral-400"
                }`}
              >
                {content.length}/{maxLength}
              </span>

              <button
                type="submit"
                disabled={
                  isDisabled ||
                  (!content.trim() && attachments.length === 0)
                }
                aria-label="Send message"
                className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-[11px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                {sending ? (
                  <>
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <ArrowUp size={13} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600"
          >
            <AlertCircle size={13} className="shrink-0" />
            {error}
          </p>
        )}
      </form>
    </div>
  );
};
