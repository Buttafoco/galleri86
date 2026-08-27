// Shared content model for the public site, the editor and preview.
// The same shape backs both the published state and the editable draft state.

export type TileSize = "small" | "medium" | "large";
export type ImageFit = "cover" | "contain";
export type ImagePlacementTarget = "frame" | "popup";

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
  /** How the image is fitted inside its fixed frame. */
  fit?: ImageFit;
  /** Horizontal and vertical focal point, expressed as percentages. */
  positionX?: number;
  positionY?: number;
  /** Zoom inside the frame, where 100 is the natural fitted size. */
  zoom?: number;
  /** Independent fitting used when the image is opened in the popup/lightbox. */
  popupFit?: ImageFit;
  popupPositionX?: number;
  popupPositionY?: number;
  popupZoom?: number;
  /** A distinct photo shown in the popup/lightbox, if set — otherwise falls back to `src`. */
  popupSrc?: string | null;
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
  | "curPopupImg"
  | "spaceImg";

export type ImageMap = Record<ImageKey, ImageItem>;

/** An artist card in the "Utställningar" grid. */
export interface ArtistItem extends ImageItem {
  key: string;
  name: string;
  date: string;
}

/** One text-only entry in the "Kommande utställningar" list. */
export interface UpcomingExhibition {
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
  /** Longer editorial description shown in the exhibition detail popup. */
  curLongDesc: string;
  spaceH: string;
  spaceP: string;
}

export type TextKey = keyof SiteTexts;

export type DayId =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/** One day in "Veckans schema". Weekday id + label are fixed (not client-editable). */
export interface ScheduleDay {
  day: DayId;
  /** Fixed Swedish weekday label, e.g. "MÅN". */
  label: string;
  /** Free-text activity/description (max 60 chars). */
  description: string;
  closed: boolean;
  /** "HH:MM" when open, null when closed. */
  opensAt: string | null;
  closesAt: string | null;
}

/** The full editable content of the site. */
export interface SiteContent {
  images: ImageMap;
  artists: ArtistItem[];
  upcomingExhibitions: UpcomingExhibition[];
  collage: CollageItem[];
  texts: SiteTexts;
  schedule: ScheduleDay[];
}

/** Which store an editable image lives in. */
export type Store = "images" | "artists" | "collage";

/** Reference to a single image across the three stores. */
export interface ItemRef {
  store: Store;
  key: string;
}

export type SiteMode = "public" | "edit" | "preview";
