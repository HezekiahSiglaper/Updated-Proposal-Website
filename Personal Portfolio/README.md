# Emmanuel Ng — space-inspired portfolio

This is Emmanuel Ng’s customized static portfolio, retaining the independently created space/planet/constellation design and adding **real content provided by Emmanuel**. Built with HTML, CSS, and JavaScript. No npm or build step required.

## Included

- Main interactive `index.html`: About, 3 project planets, credentials, constellation experience, a readable experience log, and filterable 3D skills.
- Three actual project overview pages inside `projects/`, each linked from its planet.
- `data.js` is the main content file to edit for personal details, experience, skills and project summaries.
- `case-study.css` handles the project overview pages.
- Emmanuel’s supplied portrait in `assets/emmanuel-profile.webp`, displayed in the circular About Me photo frame.
- Interests set to **DevOps** and **Mobile Development**.

## Important before public launch

1. **Photo:** The supplied profile picture is included. To change it later, replace `assets/emmanuel-profile.webp` or update `profilePhoto` in `data.js`.
2. **LinkedIn:** An exact LinkedIn profile URL was not provided, so the button is hidden. Enter it in the `linkedin` field in `data.js` to display it.
3. **Project links:** The provided GitHub profile `https://github.com/HezekiahSiglaper` was verified, but no individual repository was identified for any of the 3 projects. The project pages link only to the profile and email. Add verified, project-specific repo and demo URLs when you have them.
4. **Confirm details:** Review project descriptions, credentials and military experience for accuracy and what you are comfortable publishing. The site intentionally omits sensitive server configuration and mission database specifics.
5. **Skills:** “Blasmique” was interpreted as **Balsamiq**. Correct it in `data.js` if that is not what you intended.
6. **Raiwind dates:** No date was given, so its project page says “Not specified.”
7. **Degree and graduate date:** Not provided, so neither appears on the website.

## Deploy to GitHub Pages

Your GitHub account already has a repository called `HezekiahSiglaper.github.io`. To publish there, upload the **contents of this folder** (not the outer folder or ZIP) to that repository root:

- `index.html`
- `app.js`
- `data.js`
- `styles.css`
- `case-study.css`
- `assets/`
- `projects/`

Then go to your repository **Settings → Pages → Deploy from a branch → main → / (root)**.
If your repository already contains a website, replacing the files will replace the live site once GitHub Pages finishes deploying. Back up existing files first.

If you prefer to keep the current live website unchanged, create a new repository (for example `emmanuel-portfolio`) and deploy that instead. A project repository deploys at `https://HezekiahSiglaper.github.io/emmanuel-portfolio/`, and relative links in this website will still work.

## How to preview

Open `index.html` directly in a browser, or open the folder in VS Code using Live Server. The site uses Google Fonts when online but has local fallback fonts.

## Design note

This implementation is inspired by the layout and motion of Aahana Surya’s public portfolio. It does not copy her personal writing, portrait, projects, or source assets.
