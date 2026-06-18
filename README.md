# Dear Her MVP

Run locally:

```bash
npm install
npm run dev
```

If npm tries to download packages from any private/internal registry, run:

```bash
npm config set registry https://registry.npmjs.org/
rm -rf node_modules package-lock.json
npm cache verify
npm install --registry=https://registry.npmjs.org/
npm run dev
```
