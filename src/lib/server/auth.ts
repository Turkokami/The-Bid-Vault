import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const AUTH_COOKIE = "bid-vault-session";

function getAuthSecret() {
  return process.env.AUTH_SECRET || "bid-vault-dev-secret-change-me";
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPasswordHash(password: string, storedHash: string) {
  const [salt, savedHash] = storedHash.split(":");
  if (!salt || !savedHash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const saved = Buffer.from(savedHash, "hex");

  if (candidate.length !== saved.length) {
    return false;
  }

  return timingSafeEqual(candidate, saved);
}

function signUserId(userId: string) {
  return createHmac("sha256", getAuthSecret()).update(userId).digest("hex");
}

function buildSessionValue(userId: string) {
  return `${userId}.${signUserId(userId)}`;
}

function readUserIdFromSession(value?: string) {
  if (!value) {
    return null;
  }

  const [userId, signature] = value.split(".");
  if (!userId || !signature) {
    return null;
  }

  const expected = signUserId(userId);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer) ? userId : null;
}

export function slugifyWorkspaceName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function setAuthCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, buildSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const userId = readUserIdFromSession(cookieStore.get(AUTH_COOKIE)?.value);

  if (!userId) {
    return null;
  }

  try {
    return await db.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { tenant: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function createUserAccount(input: {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const workspaceName = input.workspaceName.trim() || `${name || "My"} Workspace`;
  const passwordHash = createPasswordHash(input.password);
  const baseSlug = slugifyWorkspaceName(workspaceName) || "my-workspace";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  let slug = baseSlug;
  let suffix = 2;
  while (await db.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      memberships: {
        create: {
          role: "OWNER",
          tenant: {
            create: {
              name: workspaceName,
              slug,
            },
          },
        },
      },
    },
    include: {
      memberships: {
        include: { tenant: true },
      },
    },
  });

  await setAuthCookie(user.id);
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: {
      memberships: {
        include: { tenant: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user?.passwordHash || !verifyPasswordHash(password, user.passwordHash)) {
    throw new Error("Email or password was not correct.");
  }

  await setAuthCookie(user.id);
  return user;
}
