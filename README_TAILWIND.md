Tailwind setup (Vite + React + TypeScript)

1) Install Tailwind and peer deps:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2) Update `tailwind.config.cjs` (or .js) contentPaths to include your src files, for example:

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

3) Replace `src/index.css` contents with Tailwind directives at the top (you can keep custom CSS below if desired):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your existing custom CSS can go here */
```

4) Start the dev server:

```bash
npm run dev
# or
npm start
```

Notes:
- The updated `src/App.tsx` uses Tailwind classes. If you don't install Tailwind, the layout will still render but without Tailwind styling.
- I added a `start` script to `package.json` so `npm start` will work (it runs `vite`).
