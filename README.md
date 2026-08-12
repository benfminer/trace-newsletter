# TRACE Newsletters

The hosted web edition of two monthly newsletters published for TRACE:

- **Transition Matters** — for TRACE staff. Ten issues, August through May, each with three weekly follow-ups.
- **Side by Side** — for TRACE paras. Ten issues, August through June.

Live at **https://benfminer.github.io/trace-newsletter/**

## What's here

Static HTML. No build step, no dependencies, no tracking. Every page opens straight from disk over `file://` as well as over HTTP.

```
index.html                     landing page for both publications
issue-01-august.html           Transition Matters 01 — the monthly
issue-01-august-week-{1,2,3}.html   the three weekly follow-ups
para-issue-01-august.html      Side by Side 01
assets/tm.css                  Transition Matters design system
assets/sbs.css                 Side by Side design system
assets/tm.js                   shared behaviour, used by both
```

Each issue carries at least one working tool rather than a description of one: an interactive model of how the Indicator 14 tiers stack, a threshold checker, an exit-date calculator, a prompting ladder, a five-second wait timer, and a prompt-fading tracker.

## Privacy

Nothing is sent anywhere. There is no analytics, no cookies, and no third-party requests except Google Fonts. The Side by Side fade tracker stores its log in the reader's own browser via `localStorage` and it never leaves the device.

## Source

This directory is generated. The editable source lives in the authoring vault under `wiki/newsletter/web/`, alongside the Outlook-safe email teasers that link here. Edit there, not here, then re-sync.
