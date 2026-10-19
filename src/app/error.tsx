"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="section">
      <div className="container">
        <div className="intro">
          <div className="eyebrow">Algo salió mal</div>
          <h1 className="h2">No pudimos cargar esta página</h1>
          <p className="lead">
            Inténtalo de nuevo. Si el problema sigue, avísale a quien administra
            el sitio.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="notice notice-error">{error.message}</p>
          )}
        </div>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Reintentar
        </button>
      </div>
    </section>
  );
}
