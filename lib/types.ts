// Shared content model for the public site, the editor and preview.
// The same shape backs both the published state and the editable draft state.

export type TileSize = "small" | "medium" | "large";

/** One artwork/image anywhere on the site. */
export interface ImageItem {
  src: string | null;
  artist: string;
  title: string;
  year: string;
  shortText: string;
  hidden: boolean;
  size: TileSize;
  /** Accessible alt text for the public site. */
  alt?: string;
}

/** Fixed single-placement images, addressed by a stable key. */
export type ImageKey =
  | "heroMain"
  | "heroC1"
  | "heroC2"
  | "heroSide"
  | "heroSideExtra"
  | "heroWide"
  | "curImg"
  | "spaceImg";

export type ImageMap = Record<ImageKey, ImageItem>;

/** An artist card in the "Utställningar" grid. */
export interface ArtistItem extends ImageItem {
  key: string;
  name: string;
  date: string;
}

export type CollageKind = "small" | "wide" | "tall" | "large";

/** A tile in the "Galleri" collage. */
export interface CollageItem extends ImageItem {
  key: string;
  kind: CollageKind;
}

export interface SiteTexts {
  intro: string;
  curTitle: string;
  curSub: string;
  curDesc: string;
  spaceH: string;
  spaceP: string;
}

export type TextKey = keyof SiteTexts;

export interface ScheduleRow {
  name: string;
  hours: string;
  event: string;
}

/** The full editable content of the site. */
export interface SiteContent {
  images: ImageMap;
  artists: ArtistItem[];
  collage: CollageItem[];
  texts: SiteTexts;
}

/** Which store an editable image lives in. */
export type Store = "images" | "artists" | "collage";

/** Reference to a single image across the three stores. */
export interface ItemRef {
  store: Store;
  key: string;
}

export type SiteMode = "public" | "edit" | "preview";
