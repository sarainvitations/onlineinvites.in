import { useEffect } from "react";
import { site } from "../config/site";
import pages from "../data/sitePages.json";
export function Metadata({
  title,
  description,
  path,
  noindex = false,
  image = "/social-card.png",
  imageAlt = "Online Invites — Every celebration deserves a beautiful invitation",
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
}) {
  useEffect(() => {
    const page = pages.find((entry) => entry.path === path);
    const pageTitle = `${page?.title ?? title} | ${site.name}`;
    const pageDescription = page?.description ?? description;
    const url = `${site.origin}${path}`;
    document.title = pageTitle;
    const update = (key: string, value: string, property = false) => {
      const attribute = property ? "property" : "name";
      let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, key);
        document.head.append(meta);
      }
      meta.content = value;
    };
    update("description", pageDescription);
    update("robots", noindex || page?.index === false ? "noindex, follow" : "index, follow");
    update("og:title", pageTitle, true);
    update("og:description", pageDescription, true);
    update("og:url", url, true);
    update("og:image", `${site.origin}${image}`, true);
    update("og:image:alt", imageAlt, true);
    update("twitter:card", "summary_large_image");
    update("twitter:title", pageTitle);
    update("twitter:description", pageDescription);
    update("twitter:image", `${site.origin}${image}`);
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = url;
  }, [title, description, path, noindex, image, imageAlt]);
  return null;
}
