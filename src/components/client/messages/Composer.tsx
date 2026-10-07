"use client";
import { ArrowUp, Loader2, Paperclip } from "lucide-react";
import {FormEvent, KeyboardEvent, useState} from "react";


interface MessageComposerProps {
  onSendMessage: (
    content: string,
    replyTo?: string
  ) => Promise<boolean>;
}


export const MessageComposer = ({
  onSendMessage,
}: MessageComposerProps) => {
  const [content, setContent] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const submit = async () => {
    const value =
      content.trim();

    if (!value || sending) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const success =
        await onSendMessage(
          value
        );

      if (success) {
        setContent("");
      }
    } catch (error) {
      console.error(
        "MESSAGE COMPOSER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await submit();
  };

  const handleKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      await submit();
    }
  };

  return (
    <div className="shrink-0 border-t border-neutral-200 px-5 py-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-[760px]"
      >
        {error && (
          <div className="mb-2 rounded-[5px] border border-red-100 bg-red-50 px-2.5 py-2 text-[7px] text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-[6px] border border-neutral-200 bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
          <button
            type="button"
            aria-label="Attach file"
            disabled
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-neutral-300"
          >
            <Paperclip
              size={12}
              strokeWidth={1.6}
            />
          </button>

          <input
            type="text"
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            maxLength={5000}
            disabled={sending}
            placeholder="Type a message..."
            className="h-7 min-w-0 flex-1 bg-transparent px-1 text-[10px] text-black outline-none placeholder:text-neutral-400 disabled:opacity-50"
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={
              sending ||
              !content.trim()
            }
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-black text-white transition-all hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {sending ? (
              <Loader2
                size={11}
                strokeWidth={1.8}
                className="animate-spin"
              />
            ) : (
              <ArrowUp
                size={11}
                strokeWidth={1.8}
              />
            )}
          </button>
        </div>

        <div className="mt-1.5 flex justify-end">
          <span className="text-[6px] text-neutral-300">
            {content.length}/5000
          </span>
        </div>
      </form>
    </div>
  );
};