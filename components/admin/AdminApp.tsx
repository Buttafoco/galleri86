"use client";

import { useRef, useState, type ChangeEvent } from "react";
import type { ArtistItem, CollageItem, ItemRef, SiteContent, TextKey } from "@/lib/types";
import { publishedContent, cloneContent } from "@/lib/content";
import GallerySite from "@/components/GallerySite";
import AdminBar from "./AdminBar";
import PreviewToolbar from "./PreviewToolbar";
import ImageEditPanel from "./ImageEditPanel";
import AddImagePanel from "./AddImagePanel";
import TextEditPanel from "./TextEditPanel";
import ConfirmDialog from "./ConfirmDialog";
import Toast from "./Toast";
import { type ImageDraft, emptyDraft } from "./types";

const TEXT_LABELS: Record<TextKey, string> = {
  intro: "Introduktionstext",
  curTitle: "Konstnärens namn",
  curSub: "Utställningens titel",
  curDesc: "Beskrivning av utställningen",
  spaceH: "Rubrik",
  spaceP: "Beskrivning",
};

export default function AdminApp() {
  const [published, setPublished] = useState<SiteContent>(() => cloneContent(publishedContent));
  const [draft, setDraft] = useState<SiteContent>(() => cloneContent(publishedContent));
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const [editingRef, setEditingRef] = useState<ItemRef | null>(null);
  const [imgDraft, setImgDraft] = useState<ImageDraft>(emptyDraft);
  const [editingText, setEditingText] = useState<TextKey | null>(null);
  const [textDraft, setTextDraft] = useState("");
  const [addSection, setAddSection] = useState<"artists" | "collage" | null>(null);
  const [addDraft, setAddDraft] = useState<ImageDraft>(emptyDraft);

  const [confirmDeleteRef, setConfirmDeleteRef] = useState<ItemRef | null>(null);
  const [confirmPreview, setConfirmPreview] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [everPublished, setEverPublished] = useState(false);

  const savedScrollY = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  // ---- data helpers -------------------------------------------------------
  const findItem = (ref: ItemRef) => {
    if (ref.store === "images") return draft.images[ref.key as keyof SiteContent["images"]];
    return (draft[ref.store] as Array<ArtistItem | CollageItem>).find((x) => x.key === ref.key);
  };

  const updateItem = (ref: ItemRef, patch: Partial<ArtistItem & CollageItem>) => {
    setDraft((s) => {
      if (ref.store === "images") {
        return {
          ...s,
          images: { ...s.images, [ref.key]: { ...s.images[ref.key as keyof typeof s.images], ...patch } },
        };
      }
      const arr = (s[ref.store] as Array<ArtistItem | CollageItem>).map((x) =>
        x.key === ref.key ? { ...x, ...patch } : x,
      );
      return { ...s, [ref.store]: arr } as SiteContent;
    });
    setDirty(true);
  };

  // ---- image panel --------------------------------------------------------
  const openImageEdit = (ref: ItemRef) => {
    const item = ref.store === "images"
      ? draft.images[ref.key as keyof SiteContent["images"]]
      : (draft[ref.store] as Array<ArtistItem | CollageItem>).find((x) => x.key === ref.key);
    if (!item) return;
    setEditingRef(ref);
    setImgDraft({
      src: item.src,
      artist: item.artist || "",
      title: item.title || "",
      year: item.year || "",
      shortText: item.shortText || "",
    });
  };
  const setImgField = (field: keyof ImageDraft, value: string) =>
    setImgDraft((d) => ({ ...d, [field]: value }));
  const onImgFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgDraft((d) => ({ ...d, src: reader.result as string }));
    reader.readAsDataURL(file);
  };
  const saveImage = () => {
    if (!editingRef) return;
    updateItem(editingRef, { ...imgDraft });
    setEditingRef(null);
    showToast("Bilden är sparad.");
  };
  const toggleHide = () => {
    if (!editingRef) return;
    const item = findItem(editingRef);
    if (item) updateItem(editingRef, { hidden: !item.hidden });
  };
  const move = (dir: number) => {
    if (!editingRef || editingRef.store === "images") return;
    const store = editingRef.store;
    setDraft((s) => {
      const arr = [...(s[store] as Array<ArtistItem | CollageItem>)];
      const i = arr.findIndex((x) => x.key === editingRef.key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, [store]: arr } as SiteContent;
    });
    setDirty(true);
  };
  const confirmDelete = () => {
    const ref = confirmDeleteRef;
    if (!ref) return;
    if (ref.store === "images") {
      updateItem(ref, { src: null, artist: "", title: "", year: "", shortText: "" });
    } else {
      setDraft((s) => ({
        ...s,
        [ref.store]: (s[ref.store] as Array<ArtistItem | CollageItem>).filter((x) => x.key !== ref.key),
      }) as SiteContent);
      setDirty(true);
    }
    setConfirmDeleteRef(null);
    setEditingRef(null);
    showToast("Bilden är borttagen.");
  };

  // ---- text panel ---------------------------------------------------------
  const openTextEdit = (key: TextKey) => {
    setEditingText(key);
    setTextDraft(draft.texts[key]);
  };
  const saveText = () => {
    if (!editingText) return;
    setDraft((s) => ({ ...s, texts: { ...s.texts, [editingText]: textDraft } }));
    setEditingText(null);
    setDirty(true);
    showToast("Texten är sparad.");
  };

  // ---- add panel ----------------------------------------------------------
  const openAdd = (section: "artists" | "collage") => {
    setAddSection(section);
    setAddDraft(emptyDraft);
  };
  const setAddField = (field: keyof ImageDraft, value: string) =>
    setAddDraft((d) => ({ ...d, [field]: value }));
  const onAddFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAddDraft((d) => ({ ...d, src: reader.result as string }));
    reader.readAsDataURL(file);
  };
  const confirmAdd = () => {
    if (!addSection) return;
    if (addSection === "artists") {
      const item: ArtistItem = {
        key: `artist-new-${Date.now()}`,
        ...addDraft,
        name: addDraft.artist || "Nytt konstverk",
        date: addDraft.year || "",
        hidden: false,
        size: "medium",
      };
      setDraft((s) => ({ ...s, artists: [...s.artists, item] }));
    } else {
      const item: CollageItem = {
        key: `collage-new-${Date.now()}`,
        kind: "small",
        ...addDraft,
        hidden: false,
        size: "small",
      };
      setDraft((s) => ({ ...s, collage: [...s.collage, item] }));
    }
    setAddSection(null);
    setDirty(true);
    showToast("Bilden är tillagd på hemsidan.");
  };

  // ---- publish / preview --------------------------------------------------
  const doPublish = () => {
    setPublished(cloneContent(draft));
    setDirty(false);
    setEverPublished(true);
  };
  const publishChanges = () => {
    doPublish();
    showToast("Ändringarna är publicerade på hemsidan.");
  };
  const closePanels = () => {
    setEditingRef(null);
    setEditingText(null);
    setAddSection(null);
  };
  const hasOpenPanel = () => !!(editingRef || editingText || addSection);
  const enterPreview = () => {
    savedScrollY.current = window.scrollY || 0;
    setMode("preview");
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };
  const requestPreview = () => {
    if (hasOpenPanel()) setConfirmPreview(true);
    else enterPreview();
  };
  const saveAndPreview = () => {
    if (editingRef) saveImage();
    else if (editingText) saveText();
    else closePanels();
    setConfirmPreview(false);
    enterPreview();
  };
  const backToEditing = () => {
    setMode("edit");
    const y = savedScrollY.current;
    requestAnimationFrame(() => window.scrollTo(0, y));
  };
  const confirmPublishFromPreview = () => {
    doPublish();
    setConfirmPublish(false);
    showToast("Ändringarna är nu publicerade på hemsidan.");
  };

  const editing = mode === "edit";
  const editingItem = editingRef ? findItem(editingRef) : null;
  void published; // published state is kept per the draft/published model; not rendered without a backend

  return (
    <>
      {editing ? (
        <AdminBar dirty={dirty} onPreview={requestPreview} onPublish={publishChanges} />
      ) : (
        <PreviewToolbar
          statusText={everPublished && !dirty ? "Publicerad" : "Förhandsvisning – ännu inte publicerad"}
          onBack={backToEditing}
          onPublish={() => setConfirmPublish(true)}
        />
      )}

      <GallerySite content={draft} mode={mode} handlers={{ openImageEdit, openTextEdit, openAdd }} />

      {toast && <Toast message={toast} />}

      {editingRef && (
        <ImageEditPanel
          draft={imgDraft}
          setField={setImgField}
          onFile={onImgFile}
          isList={editingRef.store !== "images"}
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
