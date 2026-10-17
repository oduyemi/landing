
"use client";
import { useCallback, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { LoaderCircle, Send, Paperclip, Smile, AlertCircle } from "lucide-react";

interface MessageComposerProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const MessageComposer = ({
  onSend,
  disabled = false,
  sending = false,
  placeholder = "Write a message...",
  maxLength = 5000,
}: MessageComposerProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = disabled || sending;
  const remaining = maxLength - content.length;

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, []);

  const handleChange = (value: string) => {
    setContent(value);
    if (error) setError("");
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    const message = content.trim();

    if (isDisabled) return;

    if (!message) {
      setError("Write a message before sending.");
      return;
    }

    if (message.length > maxLength) {
      setError(`Messages cannot exceed ${maxLength} characters.`);
      return;
    }

    setError("");

    try {
      await onSend(message);
      setContent("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message. Please try again."
      );
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="shrink-0 border-t border-neutral-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl"
      >
        <div
          className={`rounded-xl border bg-white transition ${
            error
              ? "border-red-300 focus-within:border-red-400"
              : "border-neutral-200 focus-within:border-neutral-400"
          } ${isDisabled ? "opacity-70" : ""}`}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => {
              handleChange(event.target.value);
              resizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Select a conversation to reply..." : placeholder}
            disabled={isDisabled}
            rows={1}
            maxLength={maxLength}
            aria-label="Write a message"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "message-composer-error" : "message-composer-hint"}
            className="block max-h-36 min-h-[46px] w-full resize-none bg-transparent px-4 pb-2 pt-3 text-xs leading-5 text-neutral-800 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
          />

          <div className="flex items-center justify-between gap-3 px-3 pb-2.5">
            <div className="flex min-w-0 items-center gap-1">
              <button
                type="button"
                disabled
                title="Attachments are not available yet"
                aria-label="Attachments unavailable"
                className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-md text-neutral-300"
              >
                <Paperclip size={15} />
              </button>

              <button
                type="button"
                disabled
                title="Emoji support is not available yet"
                aria-label="Emoji unavailable"
                className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-md text-neutral-300"
              >
                <Smile size={15} />
              </button>

              <span
                id="message-composer-hint"
                className="ml-1 hidden text-[10px] text-neutral-400 sm:inline"
              >
                Enter to send · Shift + Enter for a new line
              </span>
            </div>

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
                disabled={isDisabled || !content.trim()}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-[11px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                {sending ? (
                  <>
                    <LoaderCircle size={13} className="animate-spin" />
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p
            id="message-composer-error"
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
}
