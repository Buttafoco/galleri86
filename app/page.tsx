import GallerySite from "@/components/GallerySite";
import { publishedContent } from "@/lib/content";

export default function HomePage() {
  return <GallerySite content={publishedContent} mode="public" />;
}
