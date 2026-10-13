# David Ohimai — AI Engineering Portfolio

My portfolio for the Mastering Backend AI Engineering Bootcamp. It's a single page of hand-written HTML, CSS and JavaScript with no framework and no build step.

**Live:** https://david-ohimai.github.io/ai-engineering-portfolio/

## What's on the page

| Section | Contents |
|---|---|
| Hero | Who I am, résumé, GitHub (both accounts), LinkedIn, email, and an animated request trace from DocuChat |
| Case study 01 | **DocuChat**, the guided bootcamp project: interactive architecture diagram, RAG pipeline steps, a week-by-week build, challenges, contribution |
| Case study 02 | **MedVerify NG**, the group AI Solution Challenge: users, flow, where AI is needed, risks, proposed metrics, my engineering take |
| More AI work | KodeBuddy AI, Code Review Agent, and seven smaller LLM projects, filterable by type |
| Skills | Every skill is tied to the projects that prove it. Pick a project to highlight its skills |
| How I engineer | Four principles, each backed by a project |
| Journey | Before → LLM fundamentals → bootcamp → challenges → next |
| Contact | Email (copy to clipboard), LinkedIn, GitHub, CV, both featured repos |

Extras: dark/light theme, a <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> command palette, keyboard-accessible tabs and diagram, and `prefers-reduced-motion` support. The layout is responsive down to 320px.

## Structure

```
index.html
assets/
  css/styles.css     design tokens (light + dark), layout, components
  js/main.js         interactions (no dependencies)
  img/               portrait + social preview image
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Deploy (GitHub Pages)

```bash
git init && git add . && git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/david-ohimai/ai-engineering-portfolio.git
git push -u origin main
```

Then go to **Settings → Pages → Deploy from branch → `main` / root**. The site will be at
`https://david-ohimai.github.io/ai-engineering-portfolio/`.

(For Vercel or Netlify, import the repo and deploy with no build command and output directory `/`.)

## Before submitting: checklist

Open the page with `?todo` on the end (for example `index.html?todo`). Every item still needing attention gets a dashed orange outline.

- [x] DocuChat pushed to `david-ohimai/docuchat-bootcamp-project` and linked
- [x] MedVerify NG pushed to `david-ohimai/medverify-ng` and linked, with my role
- [x] LinkedIn set to `linkedin.com/in/david-ohimai`
- [ ] Make `code-review-agent` public, or remove its card
- [x] "Next" goals: building software, open source, remote work
- [x] Footer "Source" link and absolute `og:image` set
- [ ] Remove the `data-todo` attributes and `TODO` comments once done
- [ ] Test every link, and test on a phone
