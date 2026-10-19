"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KIND_LABEL, formatDate, yearOf } from "@/lib/format";
import type { Meeting, MeetingKind } from "@/lib/types";
import { MediaCover } from "./MediaTile";

type Filter =
  | { by: "all" }
  | { by: "year"; value: string }
  | { by: "kind"; value: MeetingKind };

function sameFilter(a: Filter, b: Filter): boolean {
  if (a.by === "all" || b.by === "all") return a.by === b.by;
  return a.by === b.by && a.value === b.value;
}

function metaLine(m: Meeting): string {
  return [formatDate(m.meeting_date), KIND_LABEL[m.kind], m.place]
    .filter(Boolean)
    .join(" · ");
}

export function MeetingsBrowser({ meetings }: { meetings: Meeting[] }) {
  const [filter, setFilter] = useState<Filter>({ by: "all" });

  const options = useMemo<{ label: string; filter: Filter }[]>(() => {
    const years = Array.from(new Set(meetings.map((m) => yearOf(m.meeting_date))))
      .sort()
      .reverse();
    const kinds = Array.from(new Set(meetings.map((m) => m.kind)));
    return [
      { label: "Todas", filter: { by: "all" } },
      ...years.map((y) => ({
        label: y,
        filter: { by: "year", value: y } as Filter,
      })),
      ...kinds.map((k) => ({
        label: KIND_LABEL[k],
        filter: { by: "kind", value: k } as Filter,
      })),
    ];
  }, [meetings]);

  const visible = meetings.filter((m) => {
    if (filter.by === "all") return true;
    if (filter.by === "year") return yearOf(m.meeting_date) === filter.value;
    return m.kind === filter.value;
  });
  const [featured, ...rest] = visible;

  return (
    <>
      {meetings.length > 1 && (
        <div className="filters" role="group" aria-label="Filtrar reuniones">
          {options.map((o) => (
            <button
              key={o.label}
              type="button"
              className="filter"
              aria-pressed={sameFilter(o.filter, filter)}
              onClick={() => setFilter(o.filter)}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {!featured ? (
        <p className="empty">No hay reuniones publicadas todavía.</p>
      ) : (
        <>
          <article className="featured">
            <Link
              href={`/reuniones/${featured.slug}`}
              className="featured-media"
              aria-label={`Ver la reunión: ${featured.title}`}
            >
              <MediaCover media={featured.media[0]} />
            </Link>
            <div className="featured-body">
              <div className="meta">{metaLine(featured)}</div>
              <h2 className="h3">{featured.title}</h2>
              <div className="steps">
                <div className="step">
                  <strong className="step-n">1</strong>
                  <div>
                    <b>Contexto</b>
                    <span>{featured.context}</span>
                  </div>
                </div>
                <div className="step">
                  <strong className="step-n">2</strong>
                  <div>
                    <b>Qué hicimos</b>
                    <span>{featured.actions}</span>
                  </div>
                </div>
                <div className="step">
                  <strong className="step-n">3</strong>
                  <div>
                    <b>Resultado</b>
                    <span>{featured.result}</span>
                  </div>
                </div>
              </div>
              <Link href={`/reuniones/${featured.slug}`} className="text-link">
                Ver reunión completa →
              </Link>
            </div>
          </article>

          {rest.length > 0 && (
            <div className="cards">
              {rest.map((m, i) => (
                <article key={m.id} className="card">
                  <Link
                    href={`/reuniones/${m.slug}`}
                    className="card-media"
                    aria-label={`Ver la reunión: ${m.title}`}
                  >
                    <MediaCover media={m.media[0]} gold={i % 3 === 2} />
                  </Link>
                  <div className="card-body">
                    <div className="meta">{metaLine(m)}</div>
                    <h3>{m.title}</h3>
                    {m.context && <p>{m.context}</p>}
                    <Link href={`/reuniones/${m.slug}`} className="text-link">
                      Ver reunión →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
