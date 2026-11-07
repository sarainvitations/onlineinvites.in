import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Search, X } from "lucide-react";
import { occasions, filterTemplates, templates } from "../data/templates";
import { DesignCarousel } from "../components/DesignCarousel";
import { Metadata } from "../components/Metadata";
export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const requestedCategory = params.get("occasion") ?? "All";
  const category = occasions.some((occasion) => occasion === requestedCategory)
    ? requestedCategory
    : "All";
  const requestedCollection = params.get("collection") ?? "All";
  const collection = ["Premium", "Basic", "Original"].includes(requestedCollection)
    ? requestedCollection === "Original" ? "Basic" : requestedCollection
    : "All";
  const results = filterTemplates(query, category, collection).sort(
    (a, b) => Number(Boolean(b.premium)) - Number(Boolean(a.premium)),
  );
  const premiumCount = templates.filter((template) => template.premium).length;
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.delete("slide");
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  }
  return (
    <main id="main-content" className="gallery-page">
      <Metadata
        title="Invitation designs"
        description="Explore all invitation cards, from timeless Basic designs to cinematic Premium experiences. Search by style and occasion to find your starting point."
        path="/designs"
      />
      <section className="page-intro container">
        <span className="eyebrow">A STYLE FOR EVERY STORY</span>
        <h1>
          Find your kind
          <br />
          of <em>beautiful.</em>
        </h1>
        <p>
          Timeless, playful, a little unexpected. Open an invitation and imagine
          your own story inside.
        </p>
        <span className="demo-disclaimer">
          All previews use fictional names, events and venues.
        </span>
      </section>
      <section
        className="container gallery-content"
        aria-label="Browse invitation designs"
      >
        <div
          className="collection-tabs"
          role="group"
          aria-label="Filter by collection"
        >
          {(
            [
              ["All", "All designs", templates.length],
              ["Premium", "Premium collection", premiumCount],
              ["Basic", "Basic collection", templates.length - premiumCount],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              aria-pressed={collection === value}
              onClick={() => update("collection", value)}
            >
              {label}
              <small>{count}</small>
            </button>
          ))}
        </div>
        <p className="collection-note">
          Twelve new cinematic invitations. Velvet curtains, moonlit skies,
          gilded gates and a little wonder. Choose a design to experience its
          opening.
        </p>
        <div className="gallery-toolbar">
          <label className="search-field">
            <Search size={19} />
            <span className="sr-only">
              Search designs by name, occasion or style
            </span>
            <input
              type="search"
              placeholder="Try botanical, birthday, minimal…"
              value={query}
              onChange={(e) => update("q", e.target.value)}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => update("q", "")}>
                <X size={16} />
              </button>
            )}
          </label>
          <p className="result-count" role="status" aria-live="polite">
            {results.length} {results.length === 1 ? "design" : "designs"} to
            discover
          </p>
        </div>
        <div
          className="filter-chips"
          role="group"
          aria-label="Filter by occasion"
        >
          {["All", ...occasions].map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              onClick={() => update("occasion", item)}
            >
              {item === "All" ? "All celebrations" : item}
            </button>
          ))}
        </div>
        {results.length ? (
          <DesignCarousel
            key={`${query}|${category}|${collection}`}
            items={results}
          />
        ) : (
          <div className="empty-gallery">
            <span aria-hidden="true">✧</span>
            <h2>A story still to be designed.</h2>
            <p>
              {query
                ? "No designs match these filters. Try another style or explore all cards."
                : `Our ${category} collection is still growing. Explore another design for inspiration, or discuss a bespoke invitation.`}
            </p>
            <div>
              <button
                className="button button-outline"
                onClick={() =>
                  setParams({}, { replace: true, preventScrollReset: true })
                }
              >
                Explore all designs
              </button>
              <Link className="text-link" to="/request-quote">
                Discuss a custom design <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </section>
      <section className="gallery-bottom container">
        <span aria-hidden="true">✳</span>
        <div>
          <h2>A different kind of celebration?</h2>
          <p>
            Every occasion has its own feeling. We can quote a design made
            around yours.
          </p>
        </div>
        <Link className="button button-outline" to="/request-quote">
          Let’s talk about it <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
