# Advanced SEO, GEO & Google Search Console Plan

## Goal

Grow qualified organic discovery for My Mentor while protecting user privacy and avoiding unqualified medical or crisis-care claims.

- **SEO:** rank useful public pages in search.
- **GEO:** make My Mentor easy for AI answer engines to understand, cite, and recommend when appropriate.
- **GSC:** measure indexing, visibility, clicks, and technical failures in Google Search Console.

## Success metrics

| Area | 90-day target | Measurement |
|---|---:|---|
| Index coverage | All intended public URLs indexed | GSC Page indexing |
| Search visibility | +30% non-branded impressions | GSC Performance |
| Qualified traffic | +20% organic sessions to public content | Analytics |
| Content quality | 10 published, expert-reviewed guides | CMS + editorial log |
| Conversion | Baseline and improve organic visit-to-sign-up rate | Analytics conversion event |
| GEO presence | Track cited/mentioned priority queries monthly | Manual answer-engine audit |

Set baselines before targets are judged. Segment brand, non-brand, country, device, page, query cluster, and search appearance.

## 1. Indexation architecture

### Public, indexable pages

- `/` — clear product/category positioning.
- `/about` — organization, mission, editorial standards, authors.
- `/articles/[slug]` — original, complete, public educational guides.
- Future public hub pages: `/topics/[topic]`, `/guides/[slug]`, `/authors/[slug]`, `/resources/[slug]`.
- Terms and privacy pages may remain indexable but are not acquisition targets.

### Private or utility pages: noindex

Apply `noindex, nofollow` (or protect behind authentication) to:

- Login, registration, onboarding, account settings.
- Member journeys, courses, lessons, journals, dashboards, chat.
- Author and admin workspaces.
- Internal search, preview, draft, query-parameter variants, and API routes.

Do not expose personal content, journal entries, progress data, member discussions, or AI chat content in sitemaps, structured data, page metadata, or crawlable HTML.

### Canonical and sitemap rules

- Use one HTTPS production hostname, declared through `NEXT_PUBLIC_SITE_URL`.
- Add self-referencing canonicals to every indexable page.
- Redirect duplicate host/protocol/trailing-slash variants once at the edge.
- Include only canonical, indexable, HTTP 200 URLs in `sitemap.xml`.
- Expand `src/app/sitemap.ts` to include public static routes and published article URLs; use actual content update dates, not a new timestamp on every build.
- Add `src/app/robots.ts` with `Sitemap: https://<domain>/sitemap.xml`; disallow authenticated, admin, author, and API paths.

## 2. Technical SEO backlog

### P0 — launch blockers

1. Verify production hostname, HTTPS redirects, canonical URLs, and `metadataBase`.
2. Add `robots.ts`, complete sitemap coverage, and submit sitemap in GSC.
3. Give each public page a unique title, meta description, canonical, Open Graph image, and Twitter card.
4. Add `generateMetadata` to article pages using article title, description/excerpt, cover image, published date, modified date, and author.
5. Return correct `404` for unknown content and `410` for permanently retired public pages when appropriate.
6. Confirm public article HTML contains the full article text server-side; do not depend on client rendering for core copy.
7. Remove malformed character encoding in visible metadata such as `â€”`.

### P1 — performance and rendering

1. Audit Core Web Vitals for mobile: LCP, INP, CLS.
2. Optimize hero and article images: meaningful filenames, dimensions, `next/image`, modern formats, compression, responsive `sizes`, and alt text.
3. Preload only the LCP image/font. Delay chat, heavy motion, carousels, and nonessential scripts.
4. Use semantic landmarks, one H1, logical heading order, descriptive links, and keyboard-accessible controls.
5. Test JS-disabled and slow-network rendering for all public pages.
6. Add automated checks for response status, robots meta, canonical, title, description, H1, and JSON-LD validity.

### P2 — information architecture

- Build topic hubs around core user needs, not thin keyword pages.
- Link every article to its hub, closely related articles, relevant public resource, and one suitable conversion page.
- Add breadcrumb navigation on articles and future topic pages.
- Retire, redirect, consolidate, or improve duplicate/thin pages; never publish doorway pages.

## 3. Content strategy and E-E-A-T

My Mentor operates near recovery and wellbeing topics. Treat content as high-trust information.

### Editorial standards

- State purpose: education and support, not diagnosis, treatment, emergency, or professional medical advice.
- Use named authors, short bios, relevant lived/professional expertise where voluntarily provided, and reviewer attribution where applicable.
- Add publication and reviewed/updated dates only when a substantive review occurred.
- Cite primary, reputable sources for factual wellbeing, addiction, trauma, and crisis-related statements.
- Add a visible safety/crisis path on applicable content. Do not present the product as a substitute for emergency services or licensed care.
- Use careful claim language. Avoid guarantees, cure claims, ranking claims, and fabricated testimonials.
- Create public Editorial Policy, Medical/Safety Review Policy, Corrections Policy, Privacy Policy, and Contact pages.

### Priority topic clusters

Start with content supported by the product and qualified reviewers:

1. Recovery support and sustainable routines.
2. Reflection and guided journaling.
3. Building support networks and accountability.
4. Personal growth through structured learning.
5. Navigating difficult seasons without making clinical claims.

For each cluster, create one hub, 3–6 deep guides, one FAQ, and internal links. Answer the user question early, then provide evidence, lived context, practical steps, limitations, and next actions.

### Keyword and intent workflow

1. Collect search demand from GSC, search suggestions, user language, support questions, and competitor gaps.
2. Classify intent: informational, comparative, navigational, or conversion.
3. Assign one primary intent and URL per query family; consolidate conflicts.
4. Build a brief: audience, question, search intent, expert/reviewer, sources, outline, internal links, conversion, and safety review.
5. Publish only content that materially improves on existing results.
6. Refresh based on GSC impressions/position, changing facts, and editorial review dates.

## 4. GEO: answer-engine readiness

GEO complements SEO. It does not mean manipulating model outputs or publishing content for bots alone.

### Content format

- Put a concise, direct answer below the H1.
- Use question-led H2/H3 headings that match real user language.
- Keep definitions, steps, comparisons, eligibility, caveats, and dates explicit.
- Prefer short factual paragraphs, ordered steps, tables where comparison helps, and clear entity names.
- Attribute claims to sources and identify author/reviewer credentials.
- Include firsthand product details only when verifiable: what My Mentor is, who it is for, key features, limits, pricing/access conditions, and privacy posture.
- Maintain a public, canonical organization/about page. Keep facts consistent across site, schema, social profiles, and reputable third-party profiles.

### Structured data

Add valid JSON-LD only where it matches visible page content:

| Page | Schema |
|---|---|
| Site-wide | `Organization`, `WebSite` |
| Article | `Article` or `BlogPosting`, `Person` author/reviewer where valid |
| Topic/guides | `CollectionPage`, `BreadcrumbList` |
| FAQ page | `FAQPage` only for visible, genuine FAQs |
| Product/service page | `SoftwareApplication` or `Service` only if fields are accurate |

Avoid fake reviews, inflated ratings, invisible FAQ markup, automated schema, or schema that makes medical claims.

### GEO measurement

Monthly, test a fixed set of high-intent questions across Google AI Overviews (where visible), ChatGPT, Perplexity, and other relevant engines. Record query, date, market, answer summary, cited domains, My Mentor mention/citation, accuracy, and next action. Treat this as directional—not a ranking report.

## 5. Google Search Console setup

### Initial configuration

1. Create a Domain property for the production domain.
2. Verify DNS ownership. Add URL-prefix property only if needed for diagnostics.
3. Submit the production sitemap.
4. Connect GSC to GA4/analytics reporting where available.
5. Grant least-privilege access: owner, full user, restricted user.
6. Set a recurring export or dashboard for 16 months of query/page trend retention.

### Weekly routine

- Check manual actions, security issues, and Page indexing errors.
- Review crawl stats, server failures, blocked resources, and robots exclusions.
- Inspect new pages and request indexing only after quality checks.
- Review top gaining/losing pages and queries; annotate releases and major content updates.

### Monthly routine

- Compare 28-day and 3-month trends by non-brand query clusters.
- Find high-impression, low-CTR pages: improve title, description, intent match, and SERP differentiation.
- Find positions 4–20: improve content depth, internal linking, source quality, and page experience.
- Find indexed-but-low-value pages: improve, merge, redirect, or noindex.
- Check rich-result/schema reports and validate changed templates.
- Review GEO audit and prioritize factual gaps or citation-quality improvements.

## 6. Reporting dashboard

Track one dashboard with:

- Organic clicks, impressions, CTR, average position, and indexed pages.
- Non-brand visibility by topic cluster and landing page.
- Organic sign-ups, activation, and other privacy-safe conversion events.
- Core Web Vitals pass rate by device.
- Crawl/indexing errors and time to resolution.
- Content publishing and refresh cadence.
- GEO citations/mentions, source accuracy, and covered question set.

Do not send personal health, journal, recovery, chat, or account content to analytics, GSC URLs, query parameters, logs, or third-party tags.

## 7. Implementation roadmap

### Weeks 1–2: foundation

- [ ] Confirm canonical production domain and environment variable.
- [ ] Add robots, canonical controls, complete sitemap, and metadata templates.
- [ ] Apply `noindex` to private/workspace routes.
- [ ] Configure GSC and submit sitemap.
- [ ] Audit public pages for response codes, rendering, headings, title/description duplication, and encoding.
- [ ] Establish analytics and GSC baselines.

### Weeks 3–4: trust and content system

- [ ] Publish About, Editorial Policy, Safety/Review Policy, Corrections, and Contact pages.
- [ ] Create author/reviewer profiles and article metadata fields.
- [ ] Add article JSON-LD, Organization/WebSite JSON-LD, breadcrumbs, and validation tests.
- [ ] Build first topic hub and three high-quality supporting guides.
- [ ] Define editorial brief, source, safety, and publishing checklists.

### Weeks 5–8: scale and optimize

- [ ] Publish remaining priority-cluster content.
- [ ] Add internal-link modules and related content blocks.
- [ ] Resolve Core Web Vitals issues.
- [ ] Run GSC query-to-page gap analysis and update pages with early impressions.
- [ ] Start monthly GEO audit.

### Ongoing

- [ ] Weekly technical and GSC triage.
- [ ] Monthly performance, content, schema, and GEO reviews.
- [ ] Quarterly content pruning, redirects, policy review, and accessibility/performance audit.

## 8. Definition of done for each public page

- [ ] Serves HTTP 200 and is publicly accessible.
- [ ] One clear purpose, one H1, useful original copy, and helpful internal links.
- [ ] Unique title, meta description, canonical, Open Graph/Twitter metadata.
- [ ] Correct index/noindex decision and sitemap inclusion/exclusion.
- [ ] Accurate structured data matching visible content.
- [ ] Responsive, accessible, and within performance budget.
- [ ] Author/reviewer, publish/update information, sources, and safety context where relevant.
- [ ] Analytics event coverage without personal/sensitive data.
- [ ] Checked in URL Inspection and monitored after launch.

## Ownership

| Area | Owner |
|---|---|
| Technical metadata, crawl controls, schema, performance | Engineering |
| Content briefs, publishing, internal linking | Content lead |
| Safety, factual and claims review | Qualified reviewer / legal as needed |
| GSC monitoring and reporting | Growth / SEO owner |
| Organic conversion and privacy-safe analytics | Product + analytics |

