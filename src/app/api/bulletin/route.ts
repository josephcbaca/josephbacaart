import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const bulletinPath = path.join(process.cwd(), "src", "data", "bulletin.json");
const githubApiUrl =
  "https://api.github.com/repos/josephcbaca/josephbacaart/contents/src/data/bulletin.json";

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

function isBulletinFields(value: unknown): value is BulletinFields {
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

function isBulletin(value: unknown): value is Bulletin {
  if (!isBulletinFields(value)) return false;
  const bulletin = value as BulletinFields & Record<string, unknown>;
  return typeof bulletin.id === "string" && typeof bulletin.updatedAt === "string";
}

async function readBulletins(): Promise<Bulletin[]> {
  const contents = await readFile(bulletinPath, "utf8");
  const data: unknown = JSON.parse(contents);

  if (!Array.isArray(data) || !data.every(isBulletin)) {
    throw new Error("Bulletin data must be an array of complete entries.");
  }

  return data as Bulletin[];
}

async function commitBulletins(bulletins: Bulletin[], token: string) {
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
  const content = Buffer.from(`${JSON.stringify(bulletins, null, 2)}\n`).toString(
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

async function persistBulletins(bulletins: Bulletin[]) {
  let localWriteError: unknown;
  try {
    await writeFile(bulletinPath, `${JSON.stringify(bulletins, null, 2)}\n`, "utf8");
  } catch (error) {
    localWriteError = error;
  }

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      await commitBulletins(bulletins, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown GitHub API error.";
      const localMessage =
        localWriteError instanceof Error
          ? ` The local write also failed: ${localWriteError.message}`
          : "";
      return { error: `${message}${localMessage}`, status: 502 };
    }

    if (localWriteError) {
      return {
        message: "Published to GitHub; this runtime could not update its local file.",
      };
    }
  } else if (localWriteError) {
    const message =
      localWriteError instanceof Error
        ? localWriteError.message
        : "Unable to write bulletin file.";
    return { error: message, status: 500 };
  }

  return { message: "Bulletin entries saved successfully." };
}

async function parseRequestBody(request: Request) {
  try {
    return { body: (await request.json()) as unknown };
  } catch {
    return { error: "Request body must be valid JSON." };
  }
}

function persistenceResponse(
  result: Awaited<ReturnType<typeof persistBulletins>>,
  payload: Record<string, unknown>,
  status = 200,
) {
  if (result.error) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(
    { ...payload, message: result.message },
    { status },
  );
}

export async function GET() {
  try {
    return Response.json(await readBulletins());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read bulletin data.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const parsed = await parseRequestBody(request);
  if (parsed.error) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  if (!isBulletinFields(parsed.body)) {
    return Response.json({ error: "Bulletin fields are incomplete or invalid." }, { status: 400 });
  }

  const bulletins = await readBulletins();
  let id = Date.now().toString();
  while (bulletins.some((bulletin) => bulletin.id === id)) {
    id = (Number(id) + 1).toString();
  }

  const bulletin: Bulletin = {
    ...parsed.body,
    id,
    updatedAt: getTimestamp(),
  };
  const updatedBulletins = [...bulletins, bulletin];
  const persistence = await persistBulletins(updatedBulletins);

  return persistenceResponse(
    persistence,
    { bulletin, bulletins: updatedBulletins },
    201,
  );
}

export async function PUT(request: Request) {
  const parsed = await parseRequestBody(request);
  if (parsed.error) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  if (
    !parsed.body ||
    typeof parsed.body !== "object" ||
    typeof (parsed.body as Record<string, unknown>).id !== "string" ||
    !isBulletinFields(parsed.body)
  ) {
    return Response.json({ error: "An id and complete bulletin fields are required." }, { status: 400 });
  }

  const body = parsed.body as BulletinFields & { id: string };
  const bulletins = await readBulletins();
  if (!bulletins.some((bulletin) => bulletin.id === body.id)) {
    return Response.json({ error: "Bulletin entry not found." }, { status: 404 });
  }

  const bulletin: Bulletin = { ...body, id: body.id, updatedAt: getTimestamp() };
  const updatedBulletins = bulletins.map((entry) =>
    entry.id === body.id ? bulletin : entry,
  );
  const persistence = await persistBulletins(updatedBulletins);

  return persistenceResponse(persistence, { bulletin, bulletins: updatedBulletins });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "An id query parameter is required." }, { status: 400 });
  }

  const bulletins = await readBulletins();
  if (!bulletins.some((bulletin) => bulletin.id === id)) {
    return Response.json({ error: "Bulletin entry not found." }, { status: 404 });
  }

  const updatedBulletins = bulletins.filter((bulletin) => bulletin.id !== id);
  const persistence = await persistBulletins(updatedBulletins);

  return persistenceResponse(persistence, { bulletins: updatedBulletins });
}
