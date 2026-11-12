"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type BulletinFields = {
  category: string;
  title: string;
  location: string;
  date: string;
  startHour: string;
  startMinute: string;
  startPeriod: string;
  endHour: string;
  endMinute: string;
  endPeriod: string;
  description: string;
};

type Bulletin = BulletinFields & {
  id: string;
  updatedAt: string;
};

type BulletinResponse = {
  bulletin?: Bulletin;
  bulletins?: Bulletin[];
  message?: string;
  error?: string;
};

const initialBulletin: BulletinFields = {
  category: "LIVE EVENT",
  title: "",
  location: "",
  date: "",
  startHour: "08",
  startMinute: "00",
  startPeriod: "PM",
  endHour: "12",
  endMinute: "00",
  endPeriod: "AM",
  description: "",
};

const hours = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);
const minutes = ["00", "15", "30", "45"];
const periods = ["AM", "PM"];

export default function AdminPage() {
  const [bulletin, setBulletin] = useState<BulletinFields>(initialBulletin);
  const [entries, setEntries] = useState<Bulletin[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("LOADING BULLETINS...");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBulletins() {
      try {
        const response = await fetch("/api/bulletin");
        const data = (await response.json()) as Bulletin[] | BulletinResponse;
        if (!response.ok || !Array.isArray(data)) {
          throw new Error(
            !Array.isArray(data) && data.error
              ? data.error
              : "Unable to load bulletin data.",
          );
        }
        setEntries(data);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to load bulletin data.");
      }
    }

    void loadBulletins();
  }, []);

  function updateField<K extends keyof BulletinFields>(
    key: K,
    value: BulletinFields[K],
  ) {
    setBulletin((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setBulletin(initialBulletin);
    setEditingId(null);
  }

  function editEntry(entry: Bulletin) {
    setBulletin({
      category: entry.category,
      title: entry.title,
      location: entry.location,
      date: entry.date,
      startHour: entry.startHour,
      startMinute: entry.startMinute,
      startPeriod: entry.startPeriod,
      endHour: entry.endHour,
      endMinute: entry.endMinute,
      endPeriod: entry.endPeriod,
      description: entry.description,
    });
    setEditingId(entry.id);
    setStatus(`EDITING ${entry.title.toUpperCase()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(editingId ? "UPDATING BULLETIN..." : "PUBLISHING BULLETIN...");

    try {
      const response = await fetch("/api/bulletin", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { ...bulletin, id: editingId } : bulletin,
        ),
      });
      const result = (await response.json()) as BulletinResponse;
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save bulletin.");
      }

      if (result.bulletins) setEntries(result.bulletins);
      resetForm();
      setStatus(result.message ?? "BULLETIN SAVED.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save bulletin.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    setDeletingId(id);
    setStatus("REMOVING BULLETIN...");

    try {
      const response = await fetch(`/api/bulletin?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as BulletinResponse;
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete bulletin.");
      }

      if (result.bulletins) setEntries(result.bulletins);
      if (editingId === id) resetForm();
      setStatus(result.message ?? "BULLETIN REMOVED.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete bulletin.");
    } finally {
      setDeletingId(null);
    }
  }

  function renderTimeFields(prefix: "start" | "end", label: string) {
    const hourKey = `${prefix}Hour` as const;
    const minuteKey = `${prefix}Minute` as const;
    const periodKey = `${prefix}Period` as const;

    return (
      <fieldset className="min-w-0">
        <legend className="mb-2 text-[10px] tracking-[0.2em] text-[#888888]">
          {label}
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: hourKey, options: hours, label: "HOUR" },
            { key: minuteKey, options: minutes, label: "MINUTE" },
            { key: periodKey, options: periods, label: "PERIOD" },
          ].map(({ key, options, label: fieldLabel }) => (
            <label key={key} className={labelClass}>
              {label} {fieldLabel}
              <select
                value={bulletin[key]}
                onChange={(event) => updateField(key, event.target.value)}
                className={fieldClass}
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  const fieldClass =
    "mt-2 w-full border border-[#222222] bg-[#080808] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] focus:border-[#ffb000] focus:outline-none";
  const labelClass = "block text-[10px] tracking-[0.2em] text-[#888888]";

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 font-mono text-[#ededed] md:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-5 text-[10px] tracking-[0.15em]">
          <span className="text-[#888888]">SYS // ADMIN CONSOLE</span>
          <div className="flex flex-wrap gap-5">
            <Link href="/admin" className="text-[#ffb000]">
              [01. BULLETIN BOARD]
            </Link>
            <Link href="/" className="text-[#888888] transition-colors hover:text-white">
              &lt;- RETURN TO TERMINAL
            </Link>
          </div>
        </nav>

        <header className="mb-8">
          <p className="mb-2 text-[10px] tracking-[0.25em] text-[#ffb000]">
            CONTROL PANEL // DISPATCH
          </p>
          <h1 className="text-2xl font-bold tracking-wider">BULLETIN BOARD</h1>
        </header>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#ffb000]">
              SECTION A // ACTIVE ENTRY FORM
            </h2>
            <div className="h-px flex-grow bg-[#222222]" />
          </div>

          <form
            onSubmit={publish}
            className="space-y-6 border border-[#222222] bg-[#080808] p-5 md:p-8"
          >
            {editingId && (
              <div className="flex items-center justify-between border border-[#4a3500] bg-[#100c03] px-3 py-2 text-[10px] tracking-wider text-[#ffb000]">
                <span>EDITING ENTRY // {editingId}</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[#888888] hover:text-white"
                >
                  [CANCEL EDIT]
                </button>
              </div>
            )}

            <label className={labelClass}>
              CATEGORY
              <select
                value={bulletin.category}
                onChange={(event) => updateField("category", event.target.value)}
                className={fieldClass}
              >
                {["LIVE ROTATIONS", "LIVE EVENT", "MIXED NUTS"].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              HEADLINE / VENUE TITLE
              <input
                type="text"
                value={bulletin.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="ADD-A-BALL"
                required
                className={fieldClass}
              />
            </label>

            <label className={labelClass}>
              LOCATION
              <input
                type="text"
                value={bulletin.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="FREMONT, SEATTLE, WA"
                required
                className={fieldClass}
              />
            </label>

            <label className={labelClass}>
              DATE
              <input
                type="date"
                value={bulletin.date}
                onChange={(event) => updateField("date", event.target.value)}
                required
                className={`${fieldClass} [color-scheme:dark]`}
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              {renderTimeFields("start", "START TIME")}
              {renderTimeFields("end", "END TIME")}
            </div>

            <label className={labelClass}>
              EVENT DESCRIPTION
              <textarea
                rows={4}
                value={bulletin.description}
                onChange={(event) => updateField("description", event.target.value)}
                required
                className={`${fieldClass} resize-y`}
              />
            </label>

            <div className="flex flex-col gap-4 border-t border-[#222222] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSaving}
                className="border border-[#ffb000] bg-[#ffb000] px-4 py-3 text-xs font-bold tracking-[0.12em] text-black transition-colors hover:bg-transparent hover:text-[#ffb000] disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving
                  ? "SAVING..."
                  : editingId
                    ? "UPDATE BULLETIN ENTRY"
                    : "PUBLISH BULLETIN UPDATE"}
              </button>
              <p role="status" aria-live="polite" className="text-[10px] text-[#ffb000]">
                {status}
              </p>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#ffb000]">
              SECTION B // LIVE PUBLIC ENTRIES
            </h2>
            <div className="h-px flex-grow bg-[#222222]" />
            <span className="text-[10px] text-[#666666]">{entries.length} ENTRIES</span>
          </div>

          {entries.length === 0 ? (
            <div className="border border-[#222222] bg-[#070707] p-6 text-center text-xs text-[#666666]">
              NO LIVE PUBLIC ENTRIES
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="border border-[#222222] bg-[#070707] p-4 md:p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-[9px] tracking-wider text-[#ffb000]">
                        {entry.category}
                      </span>
                      <h3 className="mt-1 truncate text-sm font-bold tracking-wide">
                        {entry.title}
                      </h3>
                    </div>
                    <div className="flex shrink-0 gap-3 text-[10px] tracking-wider">
                      <button
                        type="button"
                        onClick={() => editEntry(entry)}
                        className="text-[#ffb000] hover:text-white"
                        aria-label={`Edit ${entry.title}`}
                      >
                        [EDIT]
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteEntry(entry.id)}
                        disabled={deletingId === entry.id}
                        className="text-[#ff6b6b] hover:text-white disabled:opacity-50"
                        aria-label={`Delete ${entry.title}`}
                      >
                        {deletingId === entry.id ? "[DELETING...]" : "[DELETE]"}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-[#888888]">
                    {entry.location}
                    {" // "}
                    {entry.date}
                    {" // "}
                    {entry.startHour}:{entry.startMinute}{" "}
                    {entry.startPeriod}
                  </p>
                  <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-[#aaaaaa]">
                    {entry.description}
                  </p>
                  <p className="mt-3 text-[9px] text-[#555555]">
                    UPDATED // {entry.updatedAt}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
