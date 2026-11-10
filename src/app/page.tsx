import Link from "next/link";

interface Announcement {
  id: string;
  timestamp: string;
  venue: string;
  location: string;
  title: string;
  date: string;
  time: string;
  details: string;
  tag: "LIVE EVENT" | "SYSTEM" | "TRANSMISSION";
}

interface GalleryRoom {
  roomNumber: string;
  title: string;
  slug: string;
  status: "ONLINE" | "RESTRICTED" | "STANDBY";
  description: string;
}

const PRIMARY_ANNOUNCEMENT: Announcement = {
  id: "EVT-20261111",
  timestamp: "2026.11.10 // 11:28 MST",
  venue: "Add-a-Ball",
  location: "Fremont, Seattle, WA",
  title: "LIVE PERFORMANCE // DJ SET",
  date: "NOVEMBER 11, 2026",
  time: "8:00 PM – MIDNIGHT",
  details: "Analog & digital rhythms, direct hardware synthesis, high-impact sonic selection in the basement arcade.",
  tag: "LIVE EVENT",
};

const SYSTEM_NOTICES: Omit<Announcement, "venue" | "time">[] = [
  {
    id: "SYS-001",
    timestamp: "2026.11.09",
    location: "Global Gateway",
    title: "ROOT DIRECTORY RESTOCK",
    date: "2026.11.09",
    details: "Legacy frontend overwritten. High-contrast terminal bulletin active. Full gallery room partitions mounting below.",
    tag: "SYSTEM",
  },
];

const GALLERY_ROOMS: GalleryRoom[] = [
  {
    roomNumber: "01",
    title: "VISUAL ARCHIVE",
    slug: "/gallery/visual",
    status: "STANDBY",
    description: "Analog frame degradations, video datamosh sequences, and still-life documentation.",
  },
  {
    roomNumber: "02",
    title: "AUDIO TERMINAL",
    slug: "/gallery/audio",
    status: "STANDBY",
    description: "Direct MPC captures, acid lines, rhythm machine master cuts, and DJ mixes.",
  },
  {
    roomNumber: "03",
    title: "COMMUNITY SUBMISSIONS",
    slug: "/collaborate",
    status: "RESTRICTED",
    description: "External portal dispatch and open transmission link for collaborative curation.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen px-4 py-10 md:px-8 max-w-3xl mx-auto flex flex-col justify-between">
      <div className="scanline-beam" />

      <div>
        {/* Brand Emblem & Header */}
        <header className="mb-8 border-b border-[#222222] pb-6">
          <div className="flex items-center justify-between mb-6">
            <svg
              className="w-8 h-8 opacity-90"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="50,15 90,85 10,85" stroke="#FFFFFF" strokeWidth="4" />
              <polygon points="50,38 75,80 25,80" stroke="#FFFFFF" strokeWidth="3" />
            </svg>
            <div className="text-[10px] font-mono tracking-widest text-[#666666] uppercase text-right">
              <div>SYS_REV: 2026.11.10</div>
              <div className="text-emerald-500">FEED // CONNECTED</div>
            </div>
          </div>

          <h1 className="text-base font-mono font-bold tracking-[0.25em] uppercase text-white">
            JOSEPH BACA
          </h1>
          <p className="text-xs font-mono text-[#666666] tracking-wider mt-1">
            TERMINAL ENTRY // NOTIFICATION CORE & GALLERY PORTAL
          </p>
        </header>

        {/* Priority Announcement: Add-a-Ball */}
        <section className="mb-10">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ffb000] mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#ffb000] animate-pulse" />
            <span>CRITICAL DISPATCH // UPCOMING SHOW</span>
          </div>

          <article className="border-2 border-[#ffffff] bg-[#0c0c0c] p-5 shadow-[4px_4px_0px_0px_#222222] relative overflow-hidden">
            <div className="flex justify-between items-start text-[10px] font-mono border-b border-[#222222] pb-3 mb-4">
              <span className="text-black bg-white px-1.5 py-0.5 font-bold tracking-wider">
                {PRIMARY_ANNOUNCEMENT.tag}
              </span>
              <span className="text-[#888888] font-mono">
                {PRIMARY_ANNOUNCEMENT.timestamp}
              </span>
            </div>

            <div className="space-y-1 mb-4 font-mono">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">
                {PRIMARY_ANNOUNCEMENT.venue}
              </h2>
              <div className="text-xs text-[#aaaaaa] uppercase tracking-wider">
                {PRIMARY_ANNOUNCEMENT.location}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3 border-y border-[#1c1c1c] font-mono text-xs mb-4">
              <div>
                <span className="text-[#666666] block text-[10px]">DATE:</span>
                <span className="text-white font-bold tracking-wide">
                  {PRIMARY_ANNOUNCEMENT.date}
                </span>
              </div>
              <div>
                <span className="text-[#666666] block text-[10px]">TIME:</span>
                <span className="text-white font-bold tracking-wide">
                  {PRIMARY_ANNOUNCEMENT.time}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#b5b5b5] font-mono">
              {PRIMARY_ANNOUNCEMENT.details}
            </p>
          </article>
        </section>

        {/* Secondary System Notices */}
        <section className="mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666666] mb-4 flex items-center gap-2">
            <span>DISPATCH LOG</span>
            <div className="h-px bg-[#222222] flex-grow" />
          </div>

          <div className="space-y-3">
            {SYSTEM_NOTICES.map((notice) => (
              <div
                key={notice.id}
                className="border border-[#1e1e1e] bg-[#0a0a0a] p-4 text-xs font-mono"
              >
                <div className="flex justify-between text-[10px] text-[#666666] mb-1">
                  <span>{notice.id}</span>
                  <span>{notice.date}</span>
                </div>
                <div className="font-semibold text-neutral-200 mb-1">
                  {notice.title}
                </div>
                <div className="text-[#888888] text-[11px] leading-normal">
                  {notice.details}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Walkthrough Gallery Room Links */}
        <section className="mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666666] mb-4 flex items-center gap-2">
            <span>INDEX // GALLERY WALKTHROUGH</span>
            <div className="h-px bg-[#222222] flex-grow" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {GALLERY_ROOMS.map((room) => (
              <Link
                key={room.roomNumber}
                href={room.slug}
                className="group border border-[#222222] hover:border-white p-4 transition-all duration-100 bg-[#0a0a0a] block"
              >
                <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                  <span className="text-[#666666] group-hover:text-white transition-colors">
                    ROOM_{room.roomNumber}
                  </span>
                  <span className="border border-[#222222] group-hover:border-white px-1.5 py-0.2 text-[9px] text-[#888888] group-hover:text-white transition-colors">
                    {room.status}
                  </span>
                </div>
                <div className="text-sm font-mono font-bold text-white tracking-wider flex items-center justify-between">
                  <span>{room.title}</span>
                  <span className="text-xs group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#666666] group-hover:text-[#999999] transition-colors mt-1">
                  {room.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Terminal Footer */}
      <footer className="pt-6 border-t border-[#222222] flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] font-mono text-[#555555] gap-2">
        <div>LOCATION: FREMONT // SEATTLE &bull; CD NODE</div>
        <div className="flex gap-4">
          <a
            href="https://github.com/josephcbaca"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            [GITHUB]
          </a>
          <span>[SYSTEM: ONLINE]</span>
        </div>
      </footer>
    </main>
  );
}