# Telegrator Documentation Site

This is an Angular-based Single Page Application (SPA) designed to serve **MDX** (Markdown + JSX) files as a documentation site for **Telegrator**. It's fast, mobile-responsive, supports light/dark themes, and features a built-in search that iterates over your categories.

## Using MDX

This documentation site natively supports **MDX**, allowing you to write JSX and use custom components directly inside your Markdown files.

### Custom Components in MDX
Wait, if you want to use custom components natively with Angular:
You can register your Angular components as Web Components (Custom Elements) in `main.ts` and use them as standard HTML tags directly inside `.mdx` files:
```mdx
# My Doc

<my-angular-alert type="warning">This is an Angular component rendered inside MDX!</my-angular-alert>
```

The MDX renderer uses a lightweight `preact` runtime to evaluate the components on the fly in the browser!

## Adding Content

You can easily manage your documentation by modifying the `.mdx` files and mapping them out in `structure.json`.

1. Create an MDX file in `public/docs/`. E.g., `public/docs/advanced/routing.mdx`.
2. Open `public/docs/structure.json` and add an entry under the desired category (or create a new category object):

```json
{
  "category": "Advanced",
  "items": [
    {
      "title": "Routing Updates",
      "id": "advanced-routing",
      "path": "advanced/routing.mdx"
    }
  ]
}
```

The app will dynamically render the sidebar and handle routing based on the `"id"`. 

> **Important:** The `"id"` must be unique. It determines the URL (e.g., `/#/docs/advanced-routing`).

## Deploying to GitHub Pages

Since Angular SPA uses hash routing for this setup, it's very easy to deploy statically to GitHub pages. No need to worry about 404 falling back to `index.html`.

You can use the `angular-cli-ghpages` utility:

1. Push your repository to GitHub.
2. Build your app targeting the Github Pages repository base path:
   ```bash
   npm run build -- --base-href /Telegrator/
   ```
   *(Assuming your repository name is `Telegrator`)*
3. Deploy the content of the `dist/app/browser` folder to the `gh-pages` branch. 
   Optionally use `npx angular-cli-ghpages --dir=dist/app/browser`.

For automated deployment via Github Actions, create a `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy angular site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build -- --base-href /Telegrator/
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist/app/browser'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
