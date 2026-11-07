# Design and live-animation review

**Completed 3 November 2026: all 18 demos reviewed in running Chrome on desktop and mobile emulation. No invitation implementation changes made.**

The collection has useful variety in palette and cover concepts, but needs refinement before it convincingly demonstrates eighteen individually crafted experiences. The most urgent problems are premium opening-to-hero continuity, The Golden Hour's desktop name wrapping, and oversized artwork covering content during several reveals. Shared body layouts and tiny supporting text are the next priorities.

## Scope and evidence

- Reviewed the current source served by Vite on `http://127.0.0.1:5175`, with real motion enabled before loading each invitation.
- All 18: desktop **1440 × 1000**, mobile **390 × 844**, sealed cover, live opening, intermediate frames, handoff, settled hero, scrolled story/schedule/venue/closing, replay and keyboard focus.
- Additional checks for all 18: fresh reduced-motion load and keyboard Enter opening at **320 × 740**; landscape **844 × 390** geometry. These additional sizes are spot checks, not full animation reviews at every breakpoint.
- Evidence: [local viewer](../artifacts/design-review-2026-11-03/index.html), [browser observations](../artifacts/design-review-2026-11-03/results.json), [reduced-motion/layout checks](../artifacts/design-review-2026-11-03/checks.json), [navigation checks](../artifacts/design-review-2026-11-03/navigation.json).
- With the review server running, open **http://127.0.0.1:5175/artifacts/design-review-2026-11-03/index.html**. Select any demo, play its desktop recording, and compare desktop/mobile screenshots. Recordings are actual timestamped Chrome CDP screencast JPEG frames, rather than simulated animations.
- Each of 36 desktop/mobile runs has seven viewport screenshots (sealed; target 650, 1500, 2450, 2670, 3250 ms; venue) and a full invitation capture after scrolling through the reveal sections. Actual capture times are in `results.json`. Contact sheets add a comparison strip above the full page.
- All 18 desktop openings also have recorded motion frames in `<id>-motion.json`. Desktop recordings are sampled, not continuous high-frame-rate video. Mobile motion evidence is timed screenshots and browser animation state, not video.
- Artifacts are deliberately under the existing ignored `artifacts/` directory. Keep that local directory with this report; it is not automatically included in a Git commit or production build.

Limitations: this is a visual/motion review in installed Chrome, not physical iPhone, Android, Safari, screen-reader certification, a contrast audit or a frame-rate benchmark. Screenshot/screencast overhead and concurrent captures affect timing; do not infer smoothness on a low-powered phone from these recordings. External map destinations were inspected, not navigated. Only fictional demo data was used; no enquiry records were accessed. Studio homepage/gallery/form redesign and the wider Phase 5 audit are outside this review.

## Findings that affect multiple demos

### 1. Premium artwork resets at the reveal handoff — high priority

**Observed:** compare 2450 ms and 2670 ms in the premium contact sheets. Curtains return, moons and suns change scale/position/brightness, petals/facets/lanterns/ribbons return, and gates/shutters return as faint background artwork. The result feels like changing to a second scene rather than arriving inside the scene that just opened. The severity varies: Velvet, Golden Hour, Letters, Provence, Lotus and Crystal make it particularly obvious.

**Confirmed implementation cause:** `PremiumInvitation.tsx` puts `is-revealing` on the whole invitation and the opening. The opening, hero and venue each render `Scene`. Broad selectors in `premium.css` animate all matching descendants, including the incoming hero and offscreen venue. The 2600 ms state change removes the opening and the ancestor animation class; the hero's artwork returns to its static CSS state. Browser `getAnimations()` observations show three matching scene groups during reveal and no CSS animations after the handoff. This explains the observed reset; it is not just a theoretical selector concern.

**Proposed:** give the opening its own animation scope. Define a deliberate settled hero pose and preserve it through the handoff. Keep venue artwork independent. Finish from actual animation completion or a clearly coordinated timeline, with skip/reduced-motion paths landing in the same settled state. The fixed timer is fragile around delayed animations, although this review does not establish that every delayed animation is truncated.

### 2. Several scenes obscure the invitation they are meant to reveal — high priority

**Observed:** The Golden Hour's large bright sun covers incoming names; Ocean Afterglow shows two suns during the reveal; Letters in Ivory moves a blank opaque sheet over the names; Provence's bright portal washes out incoming blue type. Lotus and Crystal place bright/translucent moving geometry through the name area. These moments weaken the reveal even when the final names are legible.

**Proposed:** reserve a protected text area and coordinate text entry with the opening geometry. Let the letter itself carry the invitation, sunlight illuminate rather than cover, and decorative layers pass behind the names once they appear.

### 3. Supporting information is visually too small — high priority for usability

Large names are usually clear, but the date's month/year/time/city, section labels, demo disclosure and navigation compete poorly with the artwork. Premium styles include 7–10px supporting text, 8px date details, 10px desktop toolbar links, and a 5px mobile toolbar disclosure. This was checked through computed styles as well as screenshots. Original demos also make date/time and scroll hints much less prominent than the names.

**Proposed:** make essential event/date/time/location information approximately 14–16px on mobile; keep small labels secondary but legible. Increase toolbar/replay/map interaction areas and distinguish the venue's actual name/address from the repeated decorative heading. Exact contrast ratios and formal touch-target compliance remain for Phase 5.

### 4. The invitation bodies are too repetitive — design priority

The six originals have essentially the same story → two-event schedule → small arch/map icon → closing arrangement. Premium heroes use several layout variants, but their schedules, venue presentation and closing wording still repeat heavily. The same arched scene artwork substitutes for a meaningful venue illustration in many themes. This is a design assessment from comparing full-page captures, not a functional defect.

**Proposed:** make each theme's section composition and occasion-specific details follow its own concept. Keep shared accessible behavior and data structures without forcing every visible section into the same arrangement. Preserve all eighteen demos and the compact carousel/return behavior.

### 5. Mobile pages feel long relative to their information

At 390 × 844, original invitation pages are about 3145–3332px tall and premium pages about 3760–4126px. Height alone is not a bug. The concern is the combination of very tall heroes, small practical details, repeated generic sections and large empty gaps. Landscape heroes can be much taller than the 390px viewport, even without horizontal overflow.

**Proposed:** tune spacing around actual content and device height; keep names expressive while bringing date/time and the first useful invitation detail closer together. Review long names with real customer examples. Exploratory DOM substitutions were captured in `checks.json`; they are not proof that arbitrary names or languages fit gracefully.

## Per-demo review and proposals

All observations below come from inspected desktop and mobile browser evidence. Proposals are **not implemented**. Priority describes refinement order, not a claim that a demo is unusable.

| Demo | What works | Observed weakness | Proposed refinement | Priority |
| --- | --- | --- | --- | --- |
| **The Garden Edit** | Restrained ivory/sage palette, clear paired names and botanical corner framing. | Opening is a miniature cover followed by a fade; oversized flat leaves and a common section stack make it feel basic. Mobile date/time is much weaker than the names. | Draw in finer botanical branches around an unfolding paper invitation; carry that linework through distinct story, schedule and venue compositions; enlarge practical details. | Medium |
| **Under the Stars** | Deep teal/gold, crescent and arched frame suit the Nikah sample. | The live opening is principally a scale/fade, with little celestial choreography. The body repeats Garden's arrangement in darker colors. | Reveal a constellation/arched night sky with restrained moonlight; build an individual Nikah layout and stronger ceremony/date hierarchy. Preserve quiet, respectful motion. | Medium |
| **The Modern Vow** | Blush/espresso and left-aligned italic names establish an editorial direction. | The sliding/fading cover does not deliver a strong editorial opening. Large empty right-hand space and the decorative ampersand dominate without adding useful hierarchy. | Use a deliberate page-turn or split editorial spread, stronger name grouping and a magazine-like event/venue grid; avoid importing the same centered body stack. | Medium |
| **A Little Confetti** | Yellow/lilac, bold purple name and playful shapes are distinct from the wedding themes. | The cover rotates/scales away but there is no convincing confetti burst. The long, sparse hero and formal repeated venue structure do not fully suit a fifth birthday. | Add a brief finite confetti pop that clears the reading area; use an age-led birthday composition and playful schedule/venue blocks. | Medium |
| **A Place to Belong** | Warm earth tones, family name and arch communicate home and welcome. | The cover tilts/fades rather than opening a door; most of the experience is a recolored shared invitation. Large blank areas dilute the welcoming concept. | Make a doorway/threshold opening that reveals the family card; bring welcome, address and visiting times into a more intimate home-oriented layout. | Medium |
| **Marigold Mornings** | Saffron/ochre and warm borders distinguish the Puja sample. | Top decoration reads as a row of flat circles; the transition is another upward fade. Puja information and venue layout receive little theme-specific treatment. | Craft recognizable marigold garlands with controlled reveal motion, a finer traditional border and a clear ritual/prasad schedule. | Medium |
| **Velvet Overture** | Bordeaux/gold, curtains and theatre framing make a strong, understandable opening concept. | Curtains part successfully, then visibly return at handoff. Mobile framing and gold cords compete with the content; event details are tiny. | Preserve the parted curtain pose, remove the background reset, improve fabric depth/attachment and keep cords outside the text area. Enlarge date/time and tailor the body as a theatre programme. | **High — recommended first** |
| **Lunar Nocturne** | Indigo/silver and orbital structure create a calm premium atmosphere. | Moon changes abruptly in size/position/brightness at handoff; the beam moves through the name area. Mobile date details and scroll hint are tiny. | Keep one continuous moon position and a gentle lighting transition, place names outside the brightest beam, and bring the Nikah/date details forward. | High |
| **The Golden Hour** | Sienna/apricot and landscape composition are expressive and distinct. | At 1440px, the existing short name **Dev breaks into “De” and “v”**. The huge foreground sun covers names during reveal and then snaps to a smaller side position. Mobile name stacking is better, but the sun still covers the incoming copy. | Fix word wrapping and text-column sizing first; use one sun on a continuous path behind protected names; make hills recede without an abrupt reset. | **High — typography defect** |
| **Palace of Promises** | Sapphire/gold and a perspective gate opening establish a recognizable royal setting. | The gates reveal a luminous arch, then the hero changes to a dimmer static arch with faint gate remnants. Mobile all-capitals and small details make the composition dense. | Keep the gate's final open pose and consistent portal light, refine lattice/material detail, and use a more balanced hierarchy for names, Walima and timing. | High |
| **Letters in Ivory** | Pearl/espresso, italic names and paper materials form a coherent, personal concept. | A large blank letter sheet blocks incoming names through the middle/end of the opening. It disappears into a different static envelope composition at handoff. | Put actual invitation content on the rising letter, or move the sheet behind a coordinated name reveal; maintain the same paper/card geometry into the settled invitation. | **High — reveal obstruction** |
| **Midnight in Paris** | Onyx/champagne, restrained rules and Art Deco typography suit an anniversary. | Aperture movement produces a dense radial line pattern behind the names, then returns to quieter static geometry at handoff. All-capitals body headings and tiny details reduce warmth/readability. | Simplify and synchronize the aperture blades, retain the final open frame, and use an anniversary-specific editorial timeline/venue treatment. | High |
| **A Window in Provence** | French blue/buttercream and opening shutters communicate a strong homecoming idea. | Bright white portal light washes out the blue names during reveal; handoff suddenly restores the warm, darker type. Mobile arch is very tall and the venue repeats closed shutters. The blue italic closing phrase is also visually weak on the blue panel. | Lower and warm the light, keep text out of the glare, preserve open shutters, correct the closing phrase's contrast, and shorten the mobile architecture around the actual content. | **High — reveal readability** |
| **The Lotus Court** | Aubergine/rose-gold and circular date treatment provide a clear palette and motif. | The bloom reads as overlapping translucent wedges/pinwheel rather than a natural lotus. Petals fade out and return behind the names after handoff; they compete with copy during motion. | Rebuild the petal arrangement around a coherent flower centre, sequence the bloom behind text, and keep a stable open flower in the hero. Make the Puja body more individual. | High |
| **Ocean Afterglow** | Marine/coral, waves and italic landscape title create a relaxed coastal character. | Two sun discs are visible during reveal; the foreground one disappears abruptly at handoff. Waves reset, and the large title is more prominent than useful event information. | Use one sun and a continuous tide transition, preserve the receded wave position, and improve title/date/location balance with a coastal schedule and setting layout. | High |
| **The Crystal Ball** | Amethyst/platinum and bold sans-serif name successfully distinguish an adult birthday. | Overlapping polygons read as a rotating geometric rosette more than a crystal ball. They expand/fade through the text and reappear at handoff. | Give the object coherent faceted volume/light, keep it beside or behind protected copy, preserve its settled state, and use an age-led party layout. | High |
| **Little Moon & Stars** | Mulberry/gold, lanterns and “Baby Maryam” create a gentle Aqiqah direction. | Lanterns float away and then reappear in their static positions; mobile has a long gap between hero and story, and secondary details are undersized. | Let lanterns settle at the edges or remain absent after ascent, keep the moon continuous, and use softer spacing with family/Aqiqah details closer to the name. | High |
| **Threads of Saffron** | Vermilion/brass and silk bands make an occasion-appropriate Griha Pravesh concept. | Ribbons lift out, then return as large diagonal background bands at handoff. They resemble flat strips more than woven silk, and the body falls back to the common venue/closing pattern. | Preserve the lifted pose or settle the silk around the edges; add convincing folds/weave with restraint, and centre the threshold/home narrative and practical visiting details. | High |

## Evidence map

The viewer includes all demos. Direct contact sheets below let a future reviewer inspect both viewports without rerunning capture.

| Demo | Desktop | Mobile |
| --- | --- | --- |
| the-garden-edit | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-the-garden-edit-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-the-garden-edit-sheet.png) |
| under-the-stars | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-under-the-stars-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-under-the-stars-sheet.png) |
| the-modern-vow | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-the-modern-vow-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-the-modern-vow-sheet.png) |
| a-little-confetti | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-a-little-confetti-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-a-little-confetti-sheet.png) |
| a-place-to-belong | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-a-place-to-belong-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-a-place-to-belong-sheet.png) |
| marigold-mornings | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-marigold-mornings-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-marigold-mornings-sheet.png) |
| velvet-overture | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-velvet-overture-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-velvet-overture-sheet.png) |
| lunar-nocturne | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-lunar-nocturne-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-lunar-nocturne-sheet.png) |
| the-golden-hour | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-the-golden-hour-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-the-golden-hour-sheet.png) |
| palace-of-promises | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-palace-of-promises-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-palace-of-promises-sheet.png) |
| letters-in-ivory | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-letters-in-ivory-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-letters-in-ivory-sheet.png) |
| midnight-in-paris | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-midnight-in-paris-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-midnight-in-paris-sheet.png) |
| a-window-in-provence | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-a-window-in-provence-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-a-window-in-provence-sheet.png) |
| the-lotus-court | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-the-lotus-court-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-the-lotus-court-sheet.png) |
| ocean-afterglow | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-ocean-afterglow-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-ocean-afterglow-sheet.png) |
| the-crystal-ball | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-the-crystal-ball-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-the-crystal-ball-sheet.png) |
| little-moon-and-stars | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-little-moon-and-stars-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-little-moon-and-stars-sheet.png) |
| threads-of-saffron | [Frames + full page](../artifacts/design-review-2026-11-03/desktop-threads-of-saffron-sheet.png) | [Frames + full page](../artifacts/design-review-2026-11-03/mobile-threads-of-saffron-sheet.png) |

## Functional observations and interpretation

- All **36** full-motion desktop/mobile runs opened without a recorded page runtime error or horizontal document overflow. Replay returned focus to the opening button in all 36.
- **24** premium desktop/mobile skip checks moved focus to the invitation heading successfully.
- All **18** fresh reduced-motion keyboard openings at 320px removed the opening, focused an H1 and showed zero horizontal document overflow. The landscape geometry checks also showed zero horizontal document overflow. This does not establish that every inner element is unclipped or that every layout is attractive.
- The first capture script also tried switching the OS motion preference after mounting a page and sampling focus after 150ms; its `reduced:false` entries are an inconclusive diagnostic, not eighteen confirmed reduced-motion defects. The separate `checks.mjs` run set the preference before page load and verified all eighteen after settling. Preserve this distinction when reading raw results.
- Navigation results are recorded separately in `navigation.json`: map targets, selected-demo quote entry, and direct-demo return to the gallery/slide. This is not a new full regression-suite run or certification of browser Back/carousel behavior under every filter combination.
- Existing historical automated checks remain useful functional evidence; they cannot certify the aesthetic quality discussed here. No full test suite or production build was rerun for this documentation-only review.

## Recommended order

1. **Velvet Overture first:** establish a continuous curtain reveal, stable settled state and legible mobile event details. It is an easy concept to assess and exposes the shared premium handoff problem clearly.
2. **The Golden Hour:** correct the already-broken sample name and sun/text overlap.
3. **Letters in Ivory**, then **A Window in Provence:** repair the obstructed/washed-out reveal.
4. Refine the remaining premium demos individually, carrying over only approved shared behavior corrections. Do not silently redesign all twelve together.
5. Give the six originals their own opening and body concepts, starting with The Garden Edit as the botanical reference.

For the first refinement, acceptance should include: no scene reset; one coherent curtain opening; protected names; readable date/time/venue on mobile; replay and skip reaching consistent states; keyboard/reduced-motion behavior preserved; gallery return preserved. Compare before/after captures at identical viewports and around the handoff.

## Change log

3 November 2026: completed this review, saved browser evidence/scripts and the local playback viewer, updated handoff and implementation progress. **No demo source, styles, template data, prices, customer records, backend configuration or deployment changed.** Refinement proposals await the owner's choice of first implementation task. Phase 5 and production setup remain deferred.
