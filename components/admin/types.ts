import type { ImageFit } from "@/lib/types";

export interface ImageDraft {
  src: string | null;
  artist: string;
  title: string;
  year: string;
  shortText: string;
  fit: ImageFit;
  positionX: number;
  positionY: number;
  zoom: number;
}

export type SetImageDraftField = (field: keyof ImageDraft, value: ImageDraft[keyof ImageDraft]) => void;

export const emptyDraft: ImageDraft = {
  src: null,
  artist: "",
  title: "",
  year: "",
  shortText: "",
  fit: "cover",
  positionX: 50,
  positionY: 50,
  zoom: 100,
};

export const SHORT_TEXT_MAX = 90;
