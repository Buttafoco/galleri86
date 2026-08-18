import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import Kontakt from "@/components/sections/Kontakt";

export const metadata = {
  title: "Kontakt — Galleri 86 Stockholm",
  description: "Kontaktuppgifter, adress och karta till Galleri 86 på Skånegatan 86, Stockholm.",
};

export default function KontaktPage() {
  return (
    <>
      <Header variant="page" />
      <Kontakt />
      <Footer />
    </>
  );
}
