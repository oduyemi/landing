
"use client";
import { useAuth } from "@/context/AuthContext";
import { AdminMessages } from "@/components/admin/messages/index";
import { ArrowRight, LoaderCircle, MessageSquare, ShieldCheck } from "lucide-react";

export default function MessagesAdmin() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <main className="min-h-[70vh] bg-gradient-to-b from-slate-50 via-white to-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1600px] space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />
            </div>

            <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-100" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <LoaderCircle
                size={20}
                className="animate-spin text-indigo-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Loading your messages
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Preparing your conversation workspace...
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-4">
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-full max-w-lg animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-3/4 max-w-md animate-pulse rounded bg-slate-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-violet-100/60 blur-3xl" />

        <section className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <MessageSquare size={28} strokeWidth={1.8} />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            <ShieldCheck size={14} />
            Secure workspace
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your conversations await
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Sign in to access your project conversations, review incoming
            messages, and keep communication organized in one place.
          </p>

          <div className="mt-7 flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <ShieldCheck size={17} className="shrink-0 text-indigo-600" />
            <span>Your conversations remain behind authentication.</span>
          </div>
        </section>
      </main>
    );
  }

  const currentUserId = user._id;

  if (!currentUserId) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-12">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldCheck size={25} />
          </div>

          <h1 className="mt-5 text-lg font-semibold text-slate-900">
            Account verification needed
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We couldn't identify your account. Refresh the page and try again.
            If the problem continues, sign out and sign back in.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            Refresh page
            <ArrowRight size={16} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/70">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        

        <section aria-label="Project messages" className="min-w-0">
          <AdminMessages currentUserId={String(currentUserId)} />
        </section>
      </div>
    </main>
  );
}
