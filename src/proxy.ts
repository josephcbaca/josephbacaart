import { NextResponse, type NextRequest } from "next/server";

const unauthorized = () =>
  new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Admin Area"',
    },
  });

async function credentialsMatch(actual: string, expected: string) {
  const encoder = new TextEncoder();
  const [actualDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(actual)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const actualBytes = new Uint8Array(actualDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let difference = 0;

  for (let index = 0; index < actualBytes.length; index += 1) {
    difference |= actualBytes[index] ^ expectedBytes[index];
  }

  return difference === 0;
}

function decodeCredentials(authorization: string | null) {
  const match = authorization?.match(/^Basic\s+([A-Za-z0-9+/]+={0,2})$/i);
  if (!match) return null;

  try {
    const binary = atob(match[1]);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isBulletinWrite =
    pathname.startsWith("/api/bulletin") && request.method !== "GET";

  if (!isAdminPath && !isBulletinWrite) {
    return NextResponse.next();
  }

  const credentials = decodeCredentials(request.headers.get("authorization"));
  if (!credentials) return unauthorized();

  const expectedUsername = process.env.ADMIN_USER || "joseph";
  const expectedPassword = process.env.ADMIN_PASS || "bacaart2026";
  const [usernameMatches, passwordMatches] = await Promise.all([
    credentialsMatch(credentials.username, expectedUsername),
    credentialsMatch(credentials.password, expectedPassword),
  ]);

  if (!usernameMatches || !passwordMatches) return unauthorized();
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/bulletin/:path*"],
};
