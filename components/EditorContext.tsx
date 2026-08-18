"use client";

import { createContext, useContext } from "react";
import type { ImageItem, ImagePlacementTarget, ItemRef, SiteMode, TextKey } from "@/lib/types";

export type ImagePlacementPatch = Partial<Pick<ImageItem, "fit" | "positionX" | "positionY" | "zoom">>;

export interface LightboxPayload {
  image: ImageItem;
  refItem: ItemRef;
  /** Group used for prev/next navigation on the public site. */
  group?: "hero" | "artist" | null;
  /** Index within the group. */
  index?: number;
}

export interface ImageEditPreview {
  aspectRatio: number;
  showCaption: boolean;
  placementTarget?: ImagePlacementTarget;
}

export interface EditorApi {
  mode: SiteMode;
  /** Currently hovered tile/text key (edit mode only). */
  hoverKey: string | null;
  setHover: (key: string | null) => void;
  /** Open the image side panel for an item (edit mode only). */
  openImageEdit: (ref: ItemRef, preview?: ImageEditPreview) => void;
  /** Image currently being positioned directly in its on-page frame. */
  activeImageRef: ItemRef | null;
  activePlacementTarget: ImagePlacementTarget | null;
  updateImagePlacement: (patch: ImagePlacementPatch) => void;
  /** Open the text side panel for an editable text (edit mode only). */
  openTextEdit: (key: TextKey) => void;
  /** Open the "add image" panel for a section (edit mode only). */
  openAdd: (section: "artists" | "collage") => void;
  /** Open the weekly-schedule side panel (edit mode only). */
  openScheduleEdit: () => void;
  /** Open the upcoming-exhibitions side panel (edit mode only). */
  openUpcomingEdit: () => void;
  /** Open the lightbox (all modes). */
  openLightbox: (payload: LightboxPayload) => void;
}

const noop = () => {};

export const defaultEditorApi: EditorApi = {
  mode: "public",
  hoverKey: null,
  setHover: noop,
  openImageEdit: noop,
  activeImageRef: null,
  activePlacementTarget: null,
  updateImagePlacement: noop,
  openTextEdit: noop,
  openAdd: noop,
  openScheduleEdit: noop,
  openUpcomingEdit: noop,
  openLightbox: noop,
};

export const EditorContext = createContext<EditorApi>(defaultEditorApi);

export function useEditor(): EditorApi {
  return useContext(EditorContext);
}
