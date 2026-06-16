import { NextResponse } from "next/server";
import {
  getMyCodesSnapshot,
  removeCategoryCodeForUser,
  removeCodeListForUser,
  saveCategoryCodeForUser,
  saveCodeListForUser,
} from "@/lib/server/my-codes";

export const dynamic = "force-static";

export async function GET() {
  const snapshot = await getMyCodesSnapshot();
  return NextResponse.json(snapshot);
}

export async function POST(request: Request) {
  const body = (await request.json()) as
    | {
        action: "save-category-code";
        recordId: string;
      }
    | {
        action: "save-code-list";
        name: string;
        recordIds: string[];
        searchTerms?: string[];
      };

  if (body.action === "save-category-code") {
    const result = await saveCategoryCodeForUser(body.recordId);
    return NextResponse.json(result, { status: result.authenticated ? 200 : 401 });
  }

  if (body.action === "save-code-list") {
    const result = await saveCodeListForUser({
      name: body.name,
      recordIds: body.recordIds,
      searchTerms: body.searchTerms ?? [],
    });
    return NextResponse.json(result, { status: result.authenticated ? 200 : 401 });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as
    | {
        action: "remove-category-code";
        recordId: string;
      }
    | {
        action: "remove-code-list";
        listId: string;
      };

  if (body.action === "remove-category-code") {
    const result = await removeCategoryCodeForUser(body.recordId);
    return NextResponse.json(result, { status: result.authenticated ? 200 : 401 });
  }

  if (body.action === "remove-code-list") {
    const result = await removeCodeListForUser(body.listId);
    return NextResponse.json(result, { status: result.authenticated ? 200 : 401 });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
