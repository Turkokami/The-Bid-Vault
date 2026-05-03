import {
  findCategoryCodeRecordById,
  findCategoryCodeRecordBySourceAndCode,
  type CategoryCodeRecord,
} from "@/lib/category-codes";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/server/auth";

export type AccountSavedCodeList = {
  id: string;
  name: string;
  codes: string[];
  samCodes: string[];
  websCodes: string[];
  pscCodes: string[];
  searchTerms: string[];
  createdAt: string;
  updatedAt: string;
};

export type MyCodesSnapshot = {
  authenticated: boolean;
  savedCategoryCodeIds: string[];
  savedCodeLists: AccountSavedCodeList[];
};

function normalizeRecord(record: CategoryCodeRecord) {
  return {
    sourceName: record.sourceName,
    code: record.code,
    title: record.title,
    description: record.description,
    parentCode: record.parentCode,
    topLevelCategory: record.topLevelCategory,
    normalizedKeywords: record.normalizedKeywords.join(", "),
  };
}

async function ensureCategoryCodeRecord(record: CategoryCodeRecord) {
  return db.categoryCode.upsert({
    where: {
      sourceName_code: {
        sourceName: record.sourceName,
        code: record.code,
      },
    },
    update: normalizeRecord(record),
    create: normalizeRecord(record),
  });
}

function buildSavedCodeList(list: {
  id: string;
  name: string;
  searchTerms: string[];
  createdAt: Date;
  updatedAt: Date;
  items: {
    categoryCode: {
      sourceName: string;
      code: string;
    };
  }[];
}): AccountSavedCodeList {
  const codes = Array.from(new Set(list.items.map((item) => item.categoryCode.code)));
  const samCodes = Array.from(new Set(
    list.items
      .map((item) => item.categoryCode.code)
      .filter((code) => /^\d{6}$/.test(code)),
  ));
  const websCodes = Array.from(new Set(
    list.items
      .filter((item) => item.categoryCode.sourceName === "WEBS")
      .map((item) => item.categoryCode.code),
  ));
  const pscCodes = Array.from(new Set(
    list.items
      .filter((item) => item.categoryCode.sourceName === "PSC")
      .map((item) => item.categoryCode.code),
  ));

  return {
    id: list.id,
    name: list.name,
    codes,
    samCodes,
    websCodes,
    pscCodes,
    searchTerms: list.searchTerms,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  };
}

export async function getMyCodesSnapshot(): Promise<MyCodesSnapshot> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      authenticated: false,
      savedCategoryCodeIds: [],
      savedCodeLists: [],
    };
  }

  const [savedCategoryCodes, savedCodeLists] = await Promise.all([
    db.userSavedCategoryCode.findMany({
      where: { userId: user.id },
      include: { categoryCode: true },
      orderBy: { createdAt: "asc" },
    }),
    db.savedCategoryCodeList.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            categoryCode: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    authenticated: true,
    savedCategoryCodeIds: savedCategoryCodes
      .map((entry) =>
        findCategoryCodeRecordBySourceAndCode(entry.categoryCode.sourceName, entry.categoryCode.code)?.id ?? null,
      )
      .filter((value): value is string => Boolean(value)),
    savedCodeLists: savedCodeLists.map(buildSavedCodeList),
  };
}

export async function saveCategoryCodeForUser(recordId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authenticated: false };
  }

  const record = findCategoryCodeRecordById(recordId);
  if (!record) {
    throw new Error("That category code could not be found.");
  }

  const categoryCode = await ensureCategoryCodeRecord(record);

  await db.userSavedCategoryCode.upsert({
    where: {
      userId_categoryCodeId: {
        userId: user.id,
        categoryCodeId: categoryCode.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      categoryCodeId: categoryCode.id,
    },
  });

  return { authenticated: true };
}

export async function removeCategoryCodeForUser(recordId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authenticated: false };
  }

  const record = findCategoryCodeRecordById(recordId);
  if (!record) {
    return { authenticated: true };
  }

  const categoryCode = await db.categoryCode.findUnique({
    where: {
      sourceName_code: {
        sourceName: record.sourceName,
        code: record.code,
      },
    },
  });

  if (!categoryCode) {
    return { authenticated: true };
  }

  await db.userSavedCategoryCode.deleteMany({
    where: {
      userId: user.id,
      categoryCodeId: categoryCode.id,
    },
  });

  return { authenticated: true };
}

export async function saveCodeListForUser(input: {
  name: string;
  recordIds: string[];
  searchTerms: string[];
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authenticated: false };
  }

  const trimmedName = input.name.trim();
  const records = Array.from(new Set(input.recordIds))
    .map((recordId) => findCategoryCodeRecordById(recordId))
    .filter((record): record is CategoryCodeRecord => Boolean(record));

  if (!trimmedName || records.length === 0) {
    throw new Error("Add a name and at least one saved code before creating a reusable list.");
  }

  const categoryCodes = await Promise.all(records.map((record) => ensureCategoryCodeRecord(record)));
  const existing = await db.savedCategoryCodeList.findFirst({
    where: {
      userId: user.id,
      name: {
        equals: trimmedName,
        mode: "insensitive",
      },
    },
  });

  const list = existing
    ? await db.savedCategoryCodeList.update({
        where: { id: existing.id },
        data: {
          name: trimmedName,
          searchTerms: Array.from(new Set(input.searchTerms.map((term) => term.trim()).filter(Boolean))),
          items: {
            deleteMany: {},
            create: categoryCodes.map((categoryCode) => ({
              categoryCodeId: categoryCode.id,
            })),
          },
        },
        include: {
          items: { include: { categoryCode: true }, orderBy: { createdAt: "asc" } },
        },
      })
    : await db.savedCategoryCodeList.create({
        data: {
          userId: user.id,
          name: trimmedName,
          searchTerms: Array.from(new Set(input.searchTerms.map((term) => term.trim()).filter(Boolean))),
          items: {
            create: categoryCodes.map((categoryCode) => ({
              categoryCodeId: categoryCode.id,
            })),
          },
        },
        include: {
          items: { include: { categoryCode: true }, orderBy: { createdAt: "asc" } },
        },
      });

  return {
    authenticated: true,
    list: buildSavedCodeList(list),
  };
}

export async function removeCodeListForUser(listId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authenticated: false };
  }

  await db.savedCategoryCodeList.deleteMany({
    where: {
      id: listId,
      userId: user.id,
    },
  });

  return { authenticated: true };
}
