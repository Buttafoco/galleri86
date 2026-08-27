"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  ArtistItem,
  CollageItem,
  ImageItem,
  ImagePlacementTarget,
  ItemRef,
  ScheduleDay,
  SiteContent,
  TextKey,
  UpcomingExhibition,
} from "@/lib/types";
import type { ImageEditPreview, ImagePlacementPatch } from "@/components/EditorContext";
import { cloneContent } from "@/lib/content";
import { publishContent, saveDraftContent, uploadImage } from "@/lib/content-client";
import { createClient } from "@/lib/supabase/client";
import { validateSchedule } from "@/lib/schedule";
import GallerySite from "@/components/GallerySite";
import AdminBar from "./AdminBar";
import PreviewToolbar from "./PreviewToolbar";
import ImageEditPanel from "./ImageEditPanel";
import AddImagePanel from "./AddImagePanel";
import TextEditPanel from "./TextEditPanel";
import SchedulePanel from "./SchedulePanel";
import UpcomingExhibitionsPanel from "./UpcomingExhibitionsPanel";
import ConfirmDialog from "./ConfirmDialog";
import Toast from "./Toast";
import { type ImageDraft, type SetImageDraftField, emptyDraft } from "./types";

const TEXT_LABELS: Record<TextKey, string> = {
  intro: "Introduktionstext",
  curTitle: "Konstnärens namn",
  curSub: "Utställningens titel",
  curDesc: "Beskrivning av utställningen",
  curLongDesc: "Längre beskrivning (i popup)",
  spaceH: "Rubrik",
  spaceP: "Beskrivning",
};

const SAVE_ERROR = "Kunde inte spara ändringen. Kontrollera anslutningen och försök igen.";

/** Pure helper: apply a patch to one image/artist/collage item inside a content tree. */
function applyItemUpdate(
  content: SiteContent,
  ref: ItemRef,
  patch: Partial<ArtistItem & CollageItem>,
): SiteContent {
  if (ref.store === "images") {
    return {
      ...content,
      images: { ...content.images, [ref.key]: { ...content.images[ref.key as keyof typeof content.images], ...patch } },
    };
  }
  const arr = (content[ref.store] as Array<ArtistItem | CollageItem>).map((x) =>
    x.key === ref.key ? { ...x, ...patch } : x,
  );
  return { ...content, [ref.store]: arr } as SiteContent;
}

function imageDraftPatch(image: ImageDraft, target: ImagePlacementTarget): Partial<ImageItem> {
  // Caption fields describe the artwork itself, so they're shared and always
  // saved regardless of which crop is being edited.
  const common = {
    artist: image.artist,
    title: image.title,
    year: image.year,
    shortText: image.shortText,
  };
  if (target === "popup") {
    // Popup editing has its own photo (popupSrc, falling back to the frame's
    // src when unset) plus its own crop — it must never touch the frame's own
    // src, or "Byt bild" while customizing the popup silently replaces the
    // main photo too.
    return {
      ...common,
      popupSrc: image.src,
      popupFit: image.fit,
      popupPositionX: image.positionX,
      popupPositionY: image.positionY,
      popupZoom: image.zoom,
    };
  }
  return { ...common, src: image.src, fit: image.fit, positionX: image.positionX, positionY: image.positionY, zoom: image.zoom };
}

export default function AdminApp({
  initialDraft,
  initialPublished,
}: {
  initialDraft: SiteContent;
  initialPublished: SiteContent;
}) {
  const router = useRouter();
  const [published, setPublished] = useState<SiteContent>(() => cloneContent(initialPublished));
  const [draft, setDraft] = useState<SiteContent>(() => cloneContent(initialDraft));
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const [editingRef, setEditingRef] = useState<ItemRef | null>(null);
  const [editingPlacementTarget, setEditingPlacementTarget] = useState<ImagePlacementTarget>("frame");
  const [imgDraft, setImgDraft] = useState<ImageDraft>(emptyDraft);
  const [imagePreview, setImagePreview] = useState<ImageEditPreview>({ aspectRatio: 16 / 9, showCaption: false });
  const [uploadingImg, setUploadingImg] = useState(false);
  const [editingText, setEditingText] = useState<TextKey | null>(null);
  const [textDraft, setTextDraft] = useState("");
  const [addSection, setAddSection] = useState<"artists" | "collage" | null>(null);
  const [addDraft, setAddDraft] = useState<ImageDraft>(emptyDraft);
  const [uploadingAdd, setUploadingAdd] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDay[]>([]);
  const [scheduleErrors, setScheduleErrors] = useState<Record<string, string>>({});
  const [editingUpcoming, setEditingUpcoming] = useState(false);
  const [upcomingDraft, setUpcomingDraft] = useState<UpcomingExhibition[]>([]);

  const [confirmDeleteRef, setConfirmDeleteRef] = useState<ItemRef | null>(null);
  const [confirmPreview, setConfirmPreview] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [everPublished, setEverPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const savedScrollY = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, variant: "success" | "error" = "success") => {
    setToast({ message, variant });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  /** Commits a new draft to local state AND persists it to Supabase. Throws on
   * failure so callers can show their own success/error message. */
  const persistDraft = async (next: SiteContent) => {
    setDraft(next);
    setDirty(true);
    await saveDraftContent(next);
  };

  // ---- data helpers -------------------------------------------------------
  const findItem = (ref: ItemRef) => {
    if (ref.store === "images") return draft.images[ref.key as keyof SiteContent["images"]];
    return (draft[ref.store] as Array<ArtistItem | CollageItem>).find((x) => x.key === ref.key);
  };

  // ---- image panel --------------------------------------------------------
  const openImageEdit = (ref: ItemRef, preview?: ImageEditPreview) => {
    const item = ref.store === "images"
      ? draft.images[ref.key as keyof SiteContent["images"]]
      : (draft[ref.store] as Array<ArtistItem | CollageItem>).find((x) => x.key === ref.key);
    if (!item) return;
    const placementTarget = preview?.placementTarget ?? "frame";
    setEditingRef(ref);
    setEditingPlacementTarget(placementTarget);
    setImagePreview(preview ?? { aspectRatio: 16 / 9, showCaption: false, placementTarget });
    setImgDraft({
      src: placementTarget === "popup" ? item.popupSrc ?? item.src : item.src,
      artist: item.artist || "",
      title: item.title || "",
      year: item.year || "",
      shortText: item.shortText || "",
      fit:
        placementTarget === "popup"
          ? item.popupFit ?? "contain"
          : item.fit ??
            (ref.store === "images" && (ref.key === "curImg" || ref.key === "curPopupImg") ? "contain" : "cover"),
      positionX: placementTarget === "popup" ? item.popupPositionX ?? 50 : item.positionX ?? 50,
      positionY:
        placementTarget === "popup"
          ? item.popupPositionY ?? 50
          : item.positionY ?? (ref.store === "images" && ref.key === "heroWide" ? 15 : 50),
      zoom: placementTarget === "popup" ? item.popupZoom ?? 100 : item.zoom ?? 100,
    });
  };
  const setImgField: SetImageDraftField = (field, value) =>
    setImgDraft((d) => ({ ...d, [field]: value }));
  const updateImagePlacement = (patch: ImagePlacementPatch) =>
    setImgDraft((current) => ({ ...current, ...patch }));
  const onImgFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadImage(file);
      setImgDraft((d) => ({ ...d, src: url }));
    } catch {
      showToast("Kunde inte ladda upp bilden. Försök igen.", "error");
    } finally {
      setUploadingImg(false);
    }
  };
  const saveImage = async () => {
    if (!editingRef) return;
    const next = applyItemUpdate(draft, editingRef, imageDraftPatch(imgDraft, editingPlacementTarget));
    setEditingRef(null);
    try {
      await persistDraft(next);
      showToast("Bilden är sparad som utkast.");
    } catch {
      showToast(SAVE_ERROR, "error");
    }
  };
  const toggleHide = async () => {
    if (!editingRef) return;
    const item = findItem(editingRef);
    if (!item) return;
    const next = applyItemUpdate(draft, editingRef, { hidden: !item.hidden });
    try {
      await persistDraft(next);
      showToast(item.hidden ? "Bilden visas igen i utkastet." : "Bilden är dold i utkastet.");
    } catch {
      showToast(SAVE_ERROR, "error");
    }
  };
  const move = async (dir: number) => {
    if (!editingRef || editingRef.store === "images") return;
    const store = editingRef.store;
    const arr = [...(draft[store] as Array<ArtistItem | CollageItem>)];
    const i = arr.findIndex((x) => x.key === editingRef.key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const next = { ...draft, [store]: arr } as SiteContent;
    try {
      await persistDraft(next);
    } catch {
      showToast(SAVE_ERROR, "error");
    }
  };
  const confirmDelete = async () => {
    const ref = confirmDeleteRef;
    if (!ref) return;
    const next =
      ref.store === "images"
        ? applyItemUpdate(draft, ref, { src: null, popupSrc: null, artist: "", title: "", year: "", shortText: "" })
        : ({
            ...draft,
            [ref.store]: (draft[ref.store] as Array<ArtistItem | CollageItem>).filter((x) => x.key !== ref.key),
          } as SiteContent);
    setConfirmDeleteRef(null);
    setEditingRef(null);
    try {
      await persistDraft(next);
      showToast("Bilden är borttagen ur utkastet.");
    } catch {
      showToast(SAVE_ERROR, "error");
    }
  };

  // ---- text panel ---------------------------------------------------------
  const openTextEdit = (key: TextKey) => {
    setEditingText(key);
    setTextDraft(draft.texts[key]);
  };
  const saveText = async () => {
    if (!editingText) return;
    const next = { ...draft, texts: { ...draft.texts, [editingText]: textDraft } };
    setEditingText(null);
    try {
      await persistDraft(next);
      showToast("Texten är sparad som utkast.");
    } catch {
      showToast(SAVE_ERROR, "error");
    }
  };

  // ---- add panel ----------------------------------------------------------
  const openAdd = (section: "artists" | "collage") => {
    setAddSection(section);
    setAddDraft(emptyDraft);
  };
  const setAddField: SetImageDraftField = (field, value) =>
    setAddDraft((d) => ({ ...d, [field]: value }));
  const onAddFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAdd(true);
    try {
      const url = await uploadImage(file);
      setAddDraft((d) => ({ ...d, src: url }));
    } catch {
      showToast("Kunde inte ladda upp bilden. Försök igen.", "error");
    } finally {
      setUploadingAdd(false);
    }
  };
  const confirmAdd = async () => {
    if (!addSection) return;
    let next: SiteContent;
    if (addSection === "artists") {
      const item: ArtistItem = {
        key: `artist-new-${Date.now()}`,
        ...addDraft,
        name: addDraft.artist || "Nytt konstverk",
        date: addDraft.year || "",
        hidden: false,
        size: "medium",
      };
      next = { ...draft, artists: [...draft.artists, item] };
    } else {
      const item: CollageItem = {
        key: `collage-new-${Date.now()}`,
        kind: "small",
        ...addDraft,
        hidden: false,
        size: "small",
      };
      next = { ...draft, collage: [...draft.collage, item] };
    }
    setAddSection(null);
    try {
      await persistDraft(next);
      showToast("Bilden är tillagd i utkastet.");
    } catch {
      showToast(SAVE_ERROR, "error");
    }
  };

  // ---- weekly schedule ----------------------------------------------------
  const openScheduleEdit = () => {
    setScheduleDraft(draft.schedule.map((d) => ({ ...d })));
    setScheduleErrors({});
    setEditingSchedule(true);
  };
  const scheduleField = (day: string, patch: Partial<ScheduleDay>) =>
    setScheduleDraft((days) => days.map((d) => (d.day === day ? { ...d, ...patch } : d)));
  const saveSchedule = async (): Promise<boolean> => {
    const errs = validateSchedule(scheduleDraft);
    if (Object.keys(errs).length > 0) {
      setScheduleErrors(errs);
      return false;
    }
    const next = { ...draft, schedule: scheduleDraft.map((d) => ({ ...d })) };
    setEditingSchedule(false);
    setScheduleErrors({});
    try {
      await persistDraft(next);
      showToast("Veckans schema är sparat som utkast.");
    } catch {
      showToast(SAVE_ERROR, "error");
    }
    return true;
  };

  // ---- upcoming exhibitions ---------------------------------------------
  const openUpcomingEdit = () => {
    setUpcomingDraft(draft.upcomingExhibitions.map((item) => ({ ...item })));
    setEditingUpcoming(true);
  };
  const upcomingField = (key: string, field: "name" | "date", value: string) =>
    setUpcomingDraft((items) => items.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  const addUpcoming = () =>
    setUpcomingDraft((items) => [...items, { key: `upcoming-${crypto.randomUUID()}`, name: "", date: "" }]);
  const removeUpcoming = (key: string) =>
    setUpcomingDraft((items) => items.filter((item) => item.key !== key));
  const saveUpcoming = async (): Promise<boolean> => {
    const cleaned = upcomingDraft.map((item) => ({ ...item, name: item.name.trim(), date: item.date.trim() }));
    if (cleaned.some((item) => !item.name || !item.date)) {
      showToast("Fyll i både konstnär och period för varje utställning.", "error");
      return false;
    }
    const next = { ...draft, upcomingExhibitions: cleaned };
    setEditingUpcoming(false);
    try {
      await persistDraft(next);
      showToast("Kommande utställningar är sparade som utkast.");
      return true;
    } catch {
      showToast(SAVE_ERROR, "error");
      return false;
    }
  };

  // ---- publish / preview --------------------------------------------------
  const doPublish = async (): Promise<boolean> => {
    setPublishing(true);
    try {
      await publishContent(draft);
      setPublished(cloneContent(draft));
      setDirty(false);
      setEverPublished(true);
      return true;
    } catch {
      showToast("Kunde inte publicera ändringarna. Kontrollera anslutningen och försök igen.", "error");
      return false;
    } finally {
      setPublishing(false);
    }
  };
  const publishChanges = async () => {
    if (await doPublish()) showToast("Ändringarna är publicerade på hemsidan.");
  };
  const closePanels = () => {
    setEditingRef(null);
    setEditingPlacementTarget("frame");
    setEditingText(null);
    setAddSection(null);
    setEditingSchedule(false);
    setEditingUpcoming(false);
    setScheduleErrors({});
  };
  const hasOpenPanel = () => !!(editingRef || editingText || addSection || editingSchedule || editingUpcoming);
  const enterPreview = () => {
    savedScrollY.current = window.scrollY || 0;
    setMode("preview");
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };
  const requestPreview = () => {
    if (hasOpenPanel()) setConfirmPreview(true);
    else enterPreview();
  };
  const saveAndPreview = async () => {
    if (editingSchedule) {
      // don't leave the editor with an invalid schedule
      if (!(await saveSchedule())) {
        setConfirmPreview(false);
        return;
      }
    } else if (editingUpcoming) {
      if (!(await saveUpcoming())) {
        setConfirmPreview(false);
        return;
      }
    } else if (editingRef) await saveImage();
    else if (editingText) await saveText();
    else closePanels();
    setConfirmPreview(false);
    enterPreview();
  };
  const backToEditing = () => {
    setMode("edit");
    const y = savedScrollY.current;
    requestAnimationFrame(() => window.scrollTo(0, y));
  };
  const confirmPublishFromPreview = async () => {
    setConfirmPublish(false);
    if (await doPublish()) showToast("Ändringarna är nu publicerade på hemsidan.");
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const editing = mode === "edit";
  const editingItem = editingRef ? findItem(editingRef) : null;
  const renderedContent = editingRef
    ? applyItemUpdate(draft, editingRef, imageDraftPatch(imgDraft, editingPlacementTarget))
    : draft;
  void published; // kept for the "Publicerad"/dirty status text in the preview toolbar

  return (
    <>
      {editing ? (
        <AdminBar dirty={dirty} onPreview={requestPreview} onPublish={publishChanges} onLogout={handleLogout} publishing={publishing} />
      ) : (
        <PreviewToolbar
          statusText={everPublished && !dirty ? "Publicerad" : "Förhandsvisning – ännu inte publicerad"}
          onBack={backToEditing}
          onPublish={() => setConfirmPublish(true)}
        />
      )}

      <GallerySite
        content={renderedContent}
        mode={mode}
        handlers={{
          openImageEdit,
          activeImageRef: editingRef,
          activePlacementTarget: editingRef ? editingPlacementTarget : null,
          updateImagePlacement,
          openTextEdit,
          openAdd,
          openScheduleEdit,
          openUpcomingEdit,
        }}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} />}

      {editingRef && (
        <ImageEditPanel
          draft={imgDraft}
          setField={setImgField}
          onFile={onImgFile}
          uploading={uploadingImg}
          preview={imagePreview}
          placementTarget={editingPlacementTarget}
          isList={editingPlacementTarget === "frame" && editingRef.store !== "images"}
          hidden={!!editingItem?.hidden}
          onMoveUp={() => move(-1)}
          onMoveDown={() => move(1)}
          onToggleHide={toggleHide}
          onAskDelete={() => setConfirmDeleteRef(editingRef)}
          onSave={saveImage}
          onClose={closePanels}
        />
      )}

      {addSection && (
        <AddImagePanel
          sectionLabel={addSection === "artists" ? "Utställningar" : "Galleri"}
          draft={addDraft}
          setField={setAddField}
          onFile={onAddFile}
          uploading={uploadingAdd}
          onConfirm={confirmAdd}
          onClose={closePanels}
        />
      )}

      {editingText && (
        <TextEditPanel
          label={TEXT_LABELS[editingText]}
          value={textDraft}
          onChange={setTextDraft}
          onSave={saveText}
          onClose={closePanels}
        />
      )}

      {editingSchedule && (
        <SchedulePanel
          days={scheduleDraft}
          errors={scheduleErrors}
          onField={scheduleField}
          onSave={saveSchedule}
          onCancel={closePanels}
        />
      )}

      {editingUpcoming && (
        <UpcomingExhibitionsPanel
          items={upcomingDraft}
          onField={upcomingField}
          onAdd={addUpcoming}
          onRemove={removeUpcoming}
          onSave={saveUpcoming}
          onCancel={closePanels}
        />
      )}

      {confirmDeleteRef && (
        <ConfirmDialog
          title="Är du säker på att du vill ta bort bilden?"
          actions={[
            { label: "Nej, behåll", variant: "outline", onClick: () => setConfirmDeleteRef(null) },
            { label: "Ja, ta bort", variant: "danger", onClick: confirmDelete },
          ]}
        />
      )}

      {confirmPreview && (
        <ConfirmDialog
          title="Du har osparade ändringar"
          message="Vill du spara ändringarna innan du förhandsgranskar sidan?"
          actions={[
            { label: "Fortsätt redigera", variant: "outline", onClick: () => setConfirmPreview(false) },
            { label: "Spara och förhandsgranska", variant: "primary", onClick: saveAndPreview },
          ]}
        />
      )}

      {confirmPublish && (
        <ConfirmDialog
          title="Publicera ändringarna?"
          message="Ändringarna blir synliga för alla besökare på hemsidan."
          actions={[
            { label: "Avbryt", variant: "outline", onClick: () => setConfirmPublish(false) },
            { label: "Ja, publicera", variant: "primary", onClick: confirmPublishFromPreview },
          ]}
        />
      )}
    </>
  );
}
