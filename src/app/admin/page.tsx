"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const CATEGORIES = ["LIVE ROTATIONS", "LIVE EVENT", "MIXED NUTS"];
const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

interface BulletinEntry {
  id: string;
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
  updatedAt: string;
}

export default function AdminBulletinPage() {
  const [entries, setEntries] = useState<BulletinEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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
  });

  const [status, setStatus] = useState<string>("");

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/bulletin");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data);
      } else if (data && data.title) {
        // Fallback if legacy single object structure
        setEntries([data]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleEditClick = (entry: BulletinEntry) => {
    setEditingId(entry.id);
    setFormData({
      category: entry.category || "LIVE EVENT",
      title: entry.title || "",
      location: entry.location || "",
      date: entry.date || "",
      startHour: entry.startHour || "08",
      startMinute: entry.startMinute || "00",
      startPeriod: entry.startPeriod || "PM",
      endHour: entry.endHour || "12",
      endMinute: entry.endMinute || "00",
      endPeriod: entry.endPeriod || "AM",
      description: entry.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
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
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bulletin entry?")) return;
    setStatus("DELETING ENTRY...");
    try {
      const res = await fetch(`/api/bulletin?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatus("✓ ENTRY DELETED");
        fetchEntries();
      } else {
        setStatus("✘ ERROR DELETING ENTRY");
      }
    } catch {
      setStatus("✘ NETWORK ERROR");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(editingId ? "UPDATING ENTRY..." : "PUBLISHING ENTRY...");
    try {
      const payload = editingId ? { ...formData, id: editingId } : formData;
      const res = await fetch("/api/bulletin", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus(editingId ? "✓ ENTRY UPDATED SUCCESSFULLY" : "✓ NEW ENTRY PUBLISHED");
        handleCancelEdit();
        fetchEntries();
      } else {
        setStatus("✘ ERROR SAVING ENTRY");
      }
    } catch {
      setStatus("✘ NETWORK ERROR");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[#ededed] font-mono px-4 py-8 md:px-12">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Admin Navigation Bar */}
        <nav className="flex items-center justify-between border-b border-[#222222] pb-4 text-xs tracking-widest uppercase">
          <div className="flex items-center space-x-6">
            <span className="text-[#ffb000] font-bold">SYS // ADMIN CONSOLE</span>
            <span className="text-[#ededed] border-b border-[#ffb000] pb-1">
              [01. BULLETIN BOARD]
            </span>
          </div>
          <Link
            href="/"
            className="text-[#888888] hover:text-[#ffb000] transition-colors"
          >
            &larr; RETURN TO TERMINAL
          </Link>
        </nav>

        {/* SECTION A // ACTIVE ENTRY FORM */}
        <section className="border border-[#222222] bg-[#0a0a0a] p-6 md:p-8 space-y-6">
          <div className="border-b border-[#222222] pb-3 flex justify-between items-center">
            <h2 className="text-sm tracking-widest uppercase text-[#ffb000]">
              SECTION A // {editingId ? "EDIT BULLETIN ENTRY" : "ACTIVE ENTRY FORM"}
            </h2>
            {editingId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-[#888888] hover:text-[#ffb000] uppercase tracking-wider"
              >
                [CANCEL EDIT]
              </button>
            ) : (
              <span className="text-xs text-[#666666]">FORM_MODE: CREATE</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[#888888] tracking-wider uppercase">
                CATEGORY
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-[#050505] border border-[#333333] px-3 py-2.5 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
              >
                {CATEGORIES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[#888888] tracking-wider uppercase">
                  HEADLINE / VENUE TITLE
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="ADD-A-BALL"
                  className="w-full bg-[#050505] border border-[#333333] px-3 py-2.5 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#888888] tracking-wider uppercase">
                  LOCATION
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="FREMONT, SEATTLE, WA"
                  className="w-full bg-[#050505] border border-[#333333] px-3 py-2.5 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
                />
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="block text-[#888888] tracking-wider uppercase">
                DATE
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-[#050505] border border-[#333333] px-3 py-2.5 text-[#ededed] focus:border-[#ffb000] focus:outline-none [color-scheme:dark]"
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="space-y-1.5 border border-[#222222] p-3 bg-[#070707]">
                <label className="block text-[#888888] tracking-wider uppercase pb-1 border-b border-[#1a1a1a]">
                  START TIME
                </label>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <select
                    value={formData.startHour}
                    onChange={(e) =>
                      setFormData({ ...formData, startHour: e.target.value })
                    }
                    className="bg-[#050505] border border-[#333333] px-2 py-2 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.startMinute}
                    onChange={(e) =>
                      setFormData({ ...formData, startMinute: e.target.value })
                    }
                    className="bg-[#050505] border border-[#333333] px-2 py-2 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.startPeriod}
                    onChange={(e) =>
                      setFormData({ ...formData, startPeriod: e.target.value })
                    }
                    className="bg-[#050505] border border-[#333333] px-2 py-2 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
                  >
                    {PERIODS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 border border-[#222222] p-3 bg-[#070707]">
                <label className="block text-[#888888] tracking-wider uppercase pb-1 border-b border-[#1a1a1a]">
                  END TIME
                </label>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <select
                    value={formData.endHour}
                    onChange={(e) =>
                      setFormData({ ...formData, endHour: e.target.value })
                    }
                    className="bg-[#050505] border border-[#333333] px-2 py-2 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.endMinute}
                    onChange={(e) =>
                      setFormData({ ...formData, endMinute: e.target.value })
                    }
                    className="bg-[#050505] border border-[#333333] px-2 py-2 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.endPeriod}
                    onChange={(e) =>
                      setFormData({ ...formData, endPeriod: e.target.value })
                    }
                    className="bg-[#050505] border border-[#333333] px-2 py-2 text-[#ededed] focus:border-[#ffb000] focus:outline-none"
                  >
                    {PERIODS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[#888888] tracking-wider uppercase">
                EVENT DESCRIPTION
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-[#050505] border border-[#333333] p-3 text-[#ededed] focus:border-[#ffb000] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Submit & Status */}
            <div className="pt-2 flex flex-col md:flex-row items-center justify-between border-t border-[#222222] gap-4">
              <button
                type="submit"
                className="w-full md:w-auto bg-[#ffb000] text-[#050505] font-bold px-6 py-2.5 tracking-widest uppercase hover:bg-[#ffc233] transition-colors cursor-pointer"
              >
                {editingId ? "UPDATE BULLETIN ENTRY" : "PUBLISH BULLETIN ENTRY"}
              </button>
              {status && (
                <span className="text-[#ffb000] tracking-wider uppercase text-center">
                  {status}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* SECTION B // LIVE PUBLIC ENTRIES */}
        <section className="space-y-4 pt-4 border-t border-[#222222]">
          <div className="flex justify-between items-center">
            <h2 className="text-sm tracking-widest uppercase text-[#ffb000]">
              SECTION B // LIVE PUBLIC ENTRIES ({entries.length})
            </h2>
            <span className="text-xs text-[#666666]">MANAGEMENT_MODE: ACTIVE</span>
          </div>

          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="border border-[#222222] bg-[#070707] p-6 text-center text-[#777777] text-xs">
                NO ACTIVE BULLETIN ENTRIES FOUND.
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-[#222222] bg-[#070707] p-5 space-y-3 relative group"
                >
                  {/* Top Header Row with Edit & Delete Controls */}
                  <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2 text-xs">
                    <span className="text-[#ffb000] tracking-wider uppercase font-bold">
                      [{entry.category}]
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-[#666666]">{entry.updatedAt}</span>
                      <div className="flex items-center space-x-2 border-l border-[#222222] pl-3">
                        <button
                          type="button"
                          onClick={() => handleEditClick(entry)}
                          className="text-[#aaaaaa] hover:text-[#ffb000] transition-colors uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                          title="Edit Entry"
                        >
                          <span>✏️</span>
                          <span className="text-[11px]">EDIT</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(entry.id)}
                          className="text-[#aaaaaa] hover:text-[#ff4444] transition-colors uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                          title="Delete Entry"
                        >
                          <span>🗑️</span>
                          <span className="text-[11px]">DELETE</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-lg font-bold text-[#ffffff] uppercase tracking-tight">
                      {entry.title}
                    </h3>
                    <p className="text-xs text-[#888888] uppercase tracking-wide">
                      {entry.location}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#cccccc] pt-1 border-t border-[#1a1a1a]">
                    <div>
                      <span className="text-[#666666] uppercase">DATE: </span>
                      {entry.date}
                    </div>
                    <div>
                      <span className="text-[#666666] uppercase">TIME: </span>
                      {entry.startHour}:{entry.startMinute} {entry.startPeriod} – {entry.endHour}:{entry.endMinute} {entry.endPeriod}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#bbbbbb] leading-relaxed pt-1">
                    {entry.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}