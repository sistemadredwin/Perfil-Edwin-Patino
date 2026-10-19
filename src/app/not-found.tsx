import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="intro">
          <div className="eyebrow">Error 404</div>
          <h1 className="h2">No encontramos esa página</h1>
          <p className="lead">
            Puede que la dirección esté mal escrita o que la reunión ya no esté
            publicada.
          </p>
        </div>
        <div className="btn-row">
          <Link href="/" className="btn btn-primary">
            Volver al inicio
          </Link>
          <Link href="/reuniones" className="btn btn-outline">
            Ver reuniones
          </Link>
        </div>
      </div>
    </section>
  );
}
