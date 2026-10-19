import type { Metadata } from "next";
import { MeetingsBrowser } from "@/components/MeetingsBrowser";
import { getMeetings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Reuniones",
    path: "/reuniones",
    describe: (name) =>
      `Reuniones de trabajo de ${name}: contexto, qué se hizo y resultado, con fotos y videos.`,
  });
}

export default async function ReunionesPage() {
  const meetings = await getMeetings();

  return (
    <section className="section">
      <div className="container">
        <div className="intro">
          <div className="eyebrow">Mis reuniones</div>
          <h1 className="h2">Así hemos trabajado</h1>
          <p className="lead">
            Un registro de reuniones ya realizadas, con su contexto, lo que se
            hizo y el resultado.
          </p>
        </div>
        <MeetingsBrowser meetings={meetings} />
      </div>
    </section>
  );
}
