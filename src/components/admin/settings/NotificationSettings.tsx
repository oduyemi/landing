
"use client";
import { useState } from "react";
import { MessageSquare, BriefcaseBusiness, ListTodo } from "lucide-react";

const initialPreferences = [
  {
    id: "taskAssignments",
    title: "Task assignments",
    description: "When tasks are assigned or reassigned.",
    icon: ListTodo,
    email: true,
    inApp: true,
  },
  {
    id: "projectUpdates",
    title: "Project updates",
    description: "Changes to project status, deadlines and milestones.",
    icon: BriefcaseBusiness,
    email: true,
    inApp: true,
  },
  {
    id: "messages",
    title: "Messages",
    description: "When a client or teammate sends you a message.",
    icon: MessageSquare,
    email: true,
    inApp: true,
  },
];

export const NotificationSettings = () => {
  const [preferences, setPreferences] = useState(initialPreferences);

  function toggle(id: string, channel: "email" | "inApp") {
    setPreferences((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [channel]: !item[channel] } : item
      )
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-neutral-900">
          Notification preferences
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Choose the updates you would like to receive.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_72px_72px] gap-3 border-b border-neutral-100 pb-3 text-[11px] font-medium text-neutral-500 sm:grid-cols-[minmax(0,1fr)_100px_100px]">
        <span>Notification type</span>
        <span className="text-center">Email</span>
        <span className="text-center">In-app</span>
      </div>

      <div className="divide-y divide-neutral-100">
        {preferences.map(({ id, title, description, icon: Icon, email, inApp }) => (
          <div
            key={id}
            className="grid grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_100px_100px]"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 rounded-md border border-neutral-200 p-2 text-neutral-600">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Toggle
                label={`${title}: email notifications`}
                checked={email}
                onChange={() => toggle(id, "email")}
              />
            </div>

            <div className="flex justify-center">
              <Toggle
                label={`${title}: in-app notifications`}
                checked={inApp}
                onChange={() => toggle(id, "inApp")}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-md bg-neutral-50 p-3 text-xs leading-5 text-neutral-500">
        Preferences are currently a preview. Persistent settings require a
        database field and an API endpoint.
      </p>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        checked ? "bg-neutral-900" : "bg-neutral-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
