/* eslint-disable @next/next/no-img-element */
import { formatDuration } from "@/lib/format";
import type { Media } from "@/lib/types";

function PlayIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" fill="#15181d" />
    </svg>
  );
}

function badgeText(media: Media): string {
  return media.kind === "video"
    ? `VIDEO · ${formatDuration(media.duration_seconds)}`
    : "FOTO";
}

/**
 * Portada para tarjetas (no reproduce video: la tarjeta es un enlace).
 * Sin imagen real, muestra un bloque de relleno.
 */
export function MediaCover({
  media,
  gold = false,
}: {
  media?: Media;
  gold?: boolean;
}) {
  const image =
    media && (media.kind === "foto" ? media.url : media.thumb_url || "");
  return (
    <>
      {image ? (
        <img className="media-fill" src={image} alt={media?.caption ?? ""} />
      ) : (
        <div
          className={`media-fill ph${gold ? " ph-gold" : ""}`}
          aria-hidden="true"
        />
      )}
      {media?.kind === "video" && (
        <span className="play">
          <PlayIcon />
        </span>
      )}
      {media && <span className="badge">{badgeText(media)}</span>}
    </>
  );
}

/** Foto o video completo, para la galería y el detalle de una reunión. */
export function MediaTile({
  media,
  height,
}: {
  media: Media;
  height?: number;
}) {
  if (media.url && media.kind === "foto") {
    return (
      <figure className="tile" style={{ margin: 0 }}>
        <img src={media.url} alt={media.caption} loading="lazy" />
        {media.caption && <figcaption className="sr-only">{media.caption}</figcaption>}
      </figure>
    );
  }
  if (media.url && media.kind === "video") {
    return (
      <div className="tile">
        <video
          src={media.url}
          poster={media.thumb_url || undefined}
          controls
          playsInline
          preload="metadata"
        >
          Tu navegador no puede reproducir este video.
        </video>
      </div>
    );
  }
  // Marcador de posición (datos de ejemplo)
  return (
    <div className="tile ph" style={{ height: height ?? 260 }}>
      {media.kind === "video" && (
        <span className="play">
          <PlayIcon />
        </span>
      )}
      <span className="badge">{badgeText(media)}</span>
      <span className="ph-label">
        {media.kind === "video" ? "[Video]" : "[Foto]"}
      </span>
    </div>
  );
}
