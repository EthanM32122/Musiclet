# Musiclet

**Musiclet** – a Blooket-inspired platform with Login, Register, Stats, Market & Blooks.

Coded and owned by Ethan32.

## Features

- Landing page with LOGIN / REGISTER
- Working Register & Login (localStorage accounts)
- **Stats** – tokens, level, XP, packs opened, collection size
- **Market** – buy & open packs to collect Blooks
- **My Blooks** – view your collection by pack + rarity filter
- Daily token claim
- All data saved in browser localStorage

## How to run locally

1. Open `index.html` in any browser  
2. Or use a local server: `npx serve .`

## Deploy on Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub  
2. **Add New… → Project**  
3. Import **EthanM32122/Musiclet**  
4. Deploy (defaults are fine)  
5. You’ll get a free URL like `https://musiclet.vercel.app`

## Files

- `index.html` – pages & structure  
- `styles.css` – all styling  
- `app.js` – login, register, stats, market, blooks logic  
- `catalog.js` – packs, blooks, rarities & image URLs  

## Notes

- Images are loaded from the Bazaar-Pack asset repo.  
- Passwords are stored in plain text in localStorage (demo only – not for production).
