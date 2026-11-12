import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const bulletinPath = path.join(process.cwd(), "src", "data", "bulletin.json");
const githubApiUrl =
  "https://api.github.com/repos/josephcbaca/josephbacaart/contents/src/data/bulletin.json";

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
  updatedAt: string;
};

function getTimestamp() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}.${value("month")}.${value("day")} // ${value("hour")}:${value("minute")} MST`;
}

function isBulletin(value: unknown): value is Bulletin {
  if (!value || typeof value !== "object") return false;
  const bulletin = value as Record<string, unknown>;

  return [
    "category",
    "title",
    "location",
    "date",
    "startHour",
    "startMinute",
    "startPeriod",
    "endHour",
    "endMinute",
    "endPeriod",
    "description",
  ].every((key) => typeof bulletin[key] === "string");
}

async function commitBulletin(bulletin: Bulletin, token: string) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const currentResponse = await fetch(githubApiUrl, { headers });
  if (!currentResponse.ok) {
    throw new Error(
      `GitHub read failed (${currentResponse.status}): ${await currentResponse.text()}`,
    );
  }

  const currentFile = (await currentResponse.json()) as { sha: string };
  const content = Buffer.from(`${JSON.stringify(bulletin, null, 2)}\n`).toString(
    "base64",
  );
  const updateResponse = await fetch(githubApiUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update bulletin board",
      content,
      sha: currentFile.sha,
      branch: "main",
    }),
  });

  if (!updateResponse.ok) {
    throw new Error(
      `GitHub update failed (${updateResponse.status}): ${await updateResponse.text()}`,
    );
  }
}

export async function GET() {
  const contents = await readFile(bulletinPath, "utf8");
  return Response.json(JSON.parse(contents) as Bulletin);
}

export async function POST(request: Request) {
  let incoming: unknown;
  try {
    incoming = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isBulletin(incoming)) {
    return Response.json({ error: "Bulletin fields are incomplete or invalid." }, { status: 400 });
  }

  const bulletin: Bulletin = { ...incoming, updatedAt: getTimestamp() };
  const token = process.env.GITHUB_TOKEN;

  let localWriteError: unknown;
  try {
    await writeFile(bulletinPath, `${JSON.stringify(bulletin, null, 2)}\n`, "utf8");
  } catch (error) {
    localWriteError = error;
  }

  if (token) {
    try {
      await commitBulletin(bulletin, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown GitHub API error.";
      const localMessage =
        localWriteError instanceof Error
          ? ` The local write also failed: ${localWriteError.message}`
          : "";
      return Response.json({ error: `${message}${localMessage}` }, { status: 502 });
    }

    if (localWriteError) {
      return Response.json({
        bulletin,
        message: "Published to GitHub; this runtime could not update its local file.",
      });
    }
  } else if (localWriteError) {
    const message =
      localWriteError instanceof Error
        ? localWriteError.message
        : "Unable to write bulletin file.";
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json({ bulletin, message: "Bulletin published successfully." });
}
