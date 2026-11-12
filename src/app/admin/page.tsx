"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Bulletin = {
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

const initialBulletin: Bulletin = {
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
  const [bulletin, setBulletin] = useState<Bulletin>(initialBulletin);
  const [status, setStatus] = useState("LOADING BULLETIN...");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadBulletin() {
      try {
        const response = await fetch("/api/bulletin");
        if (!response.ok) throw new Error("Unable to load bulletin data.");
        const data = (await response.json()) as Bulletin;
        setBulletin(data);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to load bulletin data.");
      }
    }

    void loadBulletin();
  }, []);

  function updateField<K extends keyof Bulletin>(key: K, value: Bulletin[K]) {
    setBulletin((current) => ({ ...current, [key]: value }));
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("PUBLISHING BULLETIN...");

    try {
      const response = await fetch("/api/bulletin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulletin),
      });
      const result = (await response.json()) as {
        bulletin?: Bulletin;
        message?: string;
        error?: string;
      };

      if (!response.ok) throw new Error(result.error ?? "Unable to publish bulletin.");
      if (result.bulletin) setBulletin(result.bulletin);
      setStatus(result.message ?? "BULLETIN PUBLISHED.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to publish bulletin.");
    } finally {
      setIsSaving(false);
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

        <form
          onSubmit={publish}
          className="space-y-6 border border-[#222222] bg-[#080808] p-5 md:p-8"
        >
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
              {isSaving ? "PUBLISHING..." : "PUBLISH BULLETIN UPDATE"}
            </button>
            <p role="status" aria-live="polite" className="text-[10px] text-[#ffb000]">
              {status}
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
