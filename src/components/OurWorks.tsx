import { useState } from "react";
import { works } from "../data/works";
import { PortfolioPreview } from "./PortfolioPreview";

export function OurWorks() {
  const [selectedId, setSelectedId] = useState(works[0].id);
  const selected = works.find((work) => work.id === selectedId) ?? works[0];
  return (
    <section className="our-works" id="our-works" aria-labelledby="our-works-heading">
      <div className="container">
        <h1 id="our-works-heading">Our <em>works.</em></h1>
        <div className="works-browser">
          <div className="works-list" role="group" aria-label="Choose an invitation">
            {works.map((work, index) => (
              <button key={work.id} type="button" className="work-choice" aria-pressed={work.id === selected.id} aria-controls="work-preview" onClick={() => setSelectedId(work.id)}>
                Invite {index + 1}
              </button>
            ))}
          </div>
          <div className="work-preview" id="work-preview" role="region" aria-label="Selected invitation preview">
            <PortfolioPreview key={selected.id} url={selected.previewUrl} title={selected.title} />
          </div>
        </div>
      </div>
    </section>
  );
}
