# KAIA — For Causes That Matter

A mobile-first web prototype connecting individual supporters with Filipino
NGOs through donations, volunteering, following, and awareness.

**Course:** ITS142P_FOPM01_1Q2627
**Author:** Steven John O. Macabebe — Mapúa University Makati, BSIT

---

## What this is

A **frontend-only** usability prototype. There is:

- No real backend
- No database server
- No payment processing
- No real NGO verification
- No deployment

All data lives in `client/src/data/` as hardcoded JavaScript arrays.
Stateful actions (donations, follows, volunteer signups) persist in the
browser's `localStorage` so they survive a page refresh.

---

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/kaia.git
cd kaia/client
npm install
npm run dev