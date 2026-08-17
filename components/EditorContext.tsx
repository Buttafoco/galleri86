"use client";

import { createContext, useContext } from "react";
import type { ItemRef, SiteMode, TextKey } from "@/lib/types";

export interface LightboxPayload {
  src: string | null;
  artist: string;
  year: string;
  title?: string;
  shortText?: string;
  /** Group used for prev/next navigation on the public site. */
  group?: "hero" | "artist" | null;
  /** Index within the group. */
  index?: number;
}

export interface EditorApi {
  mode: SiteMode;
  /** Currently hovered tile/text key (edit mode only). */
  hoverKey: string | null;
  setHover: (key: string | null) => void;
  /** Open the image side panel for an item (edit mode only). */
  openImageEdit: (ref: ItemRef) => void;
  /** Open the text side panel for an editable text (edit mode only). */
  openTextEdit: (key: TextKey) => void;
  /** Open the "add image" panel for a section (edit mode only). */
  openAdd: (section: "artists" | "collage") => void;
  /** Open the lightbox (all modes). */
  openLightbox: (payload: LightboxPayload) => void;
}

const noop = () => {};

export const defaultEditorApi: EditorApi = {
  mode: "public",
  hoverKey: null,
  setHover: noop,
  openImageEdit: noop,
  openTextEdit: noop,
  openAdd: noop,
  openLightbox: noop,
};

export const EditorContext = createContext<EditorApi>(defaultEditorApi);

export function useEditor(): EditorApi {
  return useContext(EditorContext);
}
