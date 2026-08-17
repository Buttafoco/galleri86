export interface ImageDraft {
  src: string | null;
  artist: string;
  title: string;
  year: string;
  shortText: string;
}

export const emptyDraft: ImageDraft = { src: null, artist: "", title: "", year: "", shortText: "" };

export const SHORT_TEXT_MAX = 90;
