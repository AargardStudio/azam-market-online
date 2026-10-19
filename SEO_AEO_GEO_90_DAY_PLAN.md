# Azam Market Online — 90-Day SEO, AEO & GEO Program

Timezone: Asia/Karachi  
Rule: complete one production task per Pakistan calendar day by default; complete more only when the user explicitly requests it.

## Completion log

| Day | Date | Completed task | Evidence |
| --- | --- | --- | --- |
| 1 | 2026-10-09 | Added canonical/social metadata, Organization and WebSite JSON-LD, robots.txt, sitemap.xml and llms.txt. | Commit `ab206ef`; production verified. |
| 2 | 2026-10-17 | Added stable vendor shop URLs, browser navigation, unique vendor metadata and Store/Product offer structured data. | Commit `60bf821`; TypeScript/build passed; live vendor route returned 200. |
| 3 | 2026-10-17 | Replaced the static one-page sitemap with a cached Vercel endpoint populated from active public Supabase vendors. | Commit `e4e0f19`; handler and live XML verified with 6 URLs. |
| 4 | 2026-10-18 | Added crawlable category and market landing URLs with answer-first copy, unique metadata, CollectionPage schema and sitemap discovery. | TypeScript/build passed; sitemap handler verified 9 category, 4 market and 8 shop URLs. |
| 5 | 2026-10-19 | Added visible buyer FAQs to public directory pages with matching FAQPage structured data. | Commit `4f1f075`; TypeScript/build passed; live page verified with 5 visible answers and 5 matching schema entities. |

## Next priorities

1. Improve image alt text, dimensions, lazy loading and social-card assets.
2. Establish Search Console and Bing/IndexNow measurement baselines.

## Operating constraints

- Preserve unrelated user work and untracked files.
- Complete no more than one task per Pakistan calendar date.
- Validate TypeScript, production build, route behavior and relevant SEO artifacts.
- Commit only the selected task's files, push the existing `main` branch and verify the exact existing Vercel production project.
- Never invent search volume, ranking gains, vendor facts or product availability.
- Do not expose credentials, create duplicate hosting projects or alter unrelated DNS/email records.

