import React, { lazy, Suspense, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { Metadata } from "./components/Metadata";
import Home from "./pages/Home";
import "./styles.css";
import "./phase2.css";
import "./premium-covers.css";
const DiwaliInvitation = lazy(() => import("./pages/DiwaliInvitation"));
const OurWorks = lazy(() => import("./pages/OurWorks"));
const Gallery = lazy(() => import("./pages/Gallery"));
const TemplatePreview = lazy(() => import("./pages/TemplatePreview"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Quote = lazy(() => import("./pages/Quote"));
const Contact = lazy(() => import("./pages/Contact"));
const Policy = lazy(() => import("./pages/Policy"));
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const previousPath = useRef<string>();
  useEffect(() => {
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    else if (previousPath.current !== pathname) window.scrollTo(0, 0);
    previousPath.current = pathname;
  }, [pathname, hash]);
  return null;
}
function PendingPage() {
  const { pathname } = useLocation();
  return (
    <main id="main-content" className="container pending-page">
      <Metadata
        title="Page not found"
        description="Return to Online Invites to explore digital invitation designs."
        path={pathname}
        noindex
      />
      <span className="eyebrow">
        ONLINE INVITES
      </span>
      <h1>
        This page isn’t here yet.
      </h1>
      <p>
        Return to the homepage to explore the studio.
      </p>
      <Link className="button" to="/">
        Back to the homepage
      </Link>
    </main>
  );
}
function App() {
  const { pathname } = useLocation();
  const preview = /^\/invite\/varun-priyanka-diwali\/?$/.test(pathname) || /^\/designs\/[^/]+$/.test(pathname);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ScrollManager />
      {!preview && <Navigation />}
      <Suspense
        fallback={
          <main
            id="main-content"
            className="container route-loading"
            role="status"
          >
            Preparing something beautiful…
          </main>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/designs" element={<Gallery />} />
          <Route path="/our-works" element={<OurWorks />} />
          <Route path="/designs/:id" element={<TemplatePreview />} />
          <Route path="/invite/varun-priyanka-diwali" element={<DiwaliInvitation />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/request-quote" element={<Quote />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policies/:slug" element={<Policy />} />
          <Route path="*" element={<PendingPage />} />
        </Routes>
      </Suspense>
      {!preview && <Footer />}
    </>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
);
