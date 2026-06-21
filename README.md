# Dear Her MVP

Run locally:

```bash
npm install
npm run dev
```

## Vercel deployment

This app intentionally uses no Vercel Cron Jobs. Its daily soft plan rolls
over in the browser on the user's next visit, based on their local date, so it
does not need scheduled server work.

`vercel.json` keeps `crons` as an explicit empty list. Deploy the current
production branch once to make Vercel reconcile the project with this
configuration and remove cron jobs left by an older deployment.

If npm tries to download packages from any private/internal registry, run:

```bash
npm config set registry https://registry.npmjs.org/
rm -rf node_modules package-lock.json
npm cache verify
npm install --registry=https://registry.npmjs.org/
npm run dev
```
