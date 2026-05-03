"use client";

export type AttachmentReviewDraft = {
  reviewId: string;
  title: string;
  attachmentNames: string;
  attachmentText: string;
  internalNotes: string;
  updatedAt: string;
};

const ATTACHMENT_REVIEW_KEY = "bid-vault-attachment-reviews";

export function readAttachmentReviewDraft(reviewId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ATTACHMENT_REVIEW_KEY);
  if (!raw) {
    return null;
  }

  try {
    const drafts = JSON.parse(raw) as AttachmentReviewDraft[];
    return drafts.find((draft) => draft.reviewId === reviewId) ?? null;
  } catch {
    return null;
  }
}

export function saveAttachmentReviewDraft(draft: AttachmentReviewDraft) {
  if (typeof window === "undefined") {
    return;
  }

  const raw = window.localStorage.getItem(ATTACHMENT_REVIEW_KEY);
  let drafts: AttachmentReviewDraft[] = [];

  try {
    drafts = raw ? (JSON.parse(raw) as AttachmentReviewDraft[]) : [];
  } catch {
    drafts = [];
  }

  const next = [
    draft,
    ...drafts.filter((item) => item.reviewId !== draft.reviewId),
  ];

  window.localStorage.setItem(ATTACHMENT_REVIEW_KEY, JSON.stringify(next));
}
