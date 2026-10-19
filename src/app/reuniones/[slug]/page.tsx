import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MediaTile } from "@/components/MediaTile";
import { getMeeting, getMeetings } from "@/lib/data";
import { KIND_LABEL, formatDate } from "@/lib/format";

// Se pre-generan las reuniones publicadas. Las nuevas se generan al primer
// acceso y quedan en caché (ver docs: ISR con Cache Components).
export async function generateStaticParams() {
  const meetings = await getMeetings();
  const params = meetings.map((m) => ({ slug: m.slug }));
  // Next exige al menos un valor; si aún no hay reuniones, usa uno inexistente.
  return params.length > 0 ? params : [{ slug: "sin-reuniones" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/reuniones/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const meeting = await getMeeting(slug);
  if (!meeting) return { title: "Reunión no encontrada" };
  const description = meeting.context || undefined;
  return {
    title: meeting.title,
    description,
    alternates: { canonical: `/reuniones/${meeting.slug}` },
    openGraph: { title: meeting.title, description },
  };
}

async function MeetingDetail({
  params,
}: {
  params: PageProps<"/reuniones/[slug]">["params"];
}) {
  const { slug } = await params;
  const meeting = await getMeeting(slug);
  if (!meeting) notFound();

  const meta = [
    formatDate(meeting.meeting_date),
    KIND_LABEL[meeting.kind],
    meeting.place,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article>
      <header className="detail-head">
        <div className="meta">{meta}</div>
        <h1 className="h2">{meeting.title}</h1>
      </header>

      <div className="detail-steps">
        <section className="detail-step">
          <h2>Contexto</h2>
          <p>{meeting.context}</p>
        </section>
        <section className="detail-step">
          <h2>Qué hicimos</h2>
          <p>{meeting.actions}</p>
        </section>
        <section className="detail-step">
          <h2>Resultado</h2>
          <p>{meeting.result}</p>
        </section>
      </div>

      {meeting.media.length > 0 && (
        <div className="media-grid">
          {meeting.media.map((m) => (
            <MediaTile key={m.id} media={m} height={300} />
          ))}
        </div>
      )}
    </article>
  );
}

export default function MeetingPage(props: PageProps<"/reuniones/[slug]">) {
  return (
    <section className="section">
      <div className="container">
        <Link href="/reuniones" className="back">
          ← Todas las reuniones
        </Link>
        <Suspense fallback={<p className="empty">Cargando reunión…</p>}>
          <MeetingDetail params={props.params} />
        </Suspense>
      </div>
    </section>
  );
}
