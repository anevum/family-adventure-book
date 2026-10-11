# Deploy The Adventure Book — public-source demonstration

## Verified repository
GitHub: https://github.com/anevum/family-adventure-book

The repo is public **by the owner's choice**, but the eventual family app and personal data must be private. Do not put photos, family records, keys, credentials or saved user data in Git.

## Cloudflare Pages (requires account owner sign-in)
1. Sign into https://dash.cloudflare.com/ in the account that should host the game.
2. Go to **Workers & Pages**, create a **Pages** project, then choose **Connect to Git**.
3. Authorize GitHub and select `anevum/family-adventure-book`. Give the Cloudflare integration repo-specific access when possible.
4. Use branch `main`, Framework `None`, root `/`, build output `public`, build command blank.
5. Deploy, then open the generated `*.pages.dev` URL to test navigation and local-save gameplay.
6. To use your preferred name, open **Custom domains** for the Pages project and add `adventurebook.anevum.com`. Follow Cloudflare's generated DNS instructions. Create only the new subdomain record. Do not change the apex, www, nameservers or existing ANEVUM DNS.

Cloudflare Pages automatic Git deployments run when the connected repository's configured production branch changes, subject to quotas.

## Privacy before invitations
The currently deployed demo would be publicly reachable (even if unlisted). There is no real login. Do not treat the app as a private scrapbook or upload family media.

Before family use, implement real accounts, invitations, guardian-managed child profiles, per-family authorization, secure private image storage, backups, export/deletion and access policies at every hostname (`*.pages.dev` and the custom domain). Cloudflare Access is one possible preview restriction, but it is not a replacement for application-level family permissions.

## Finances
Use Cloudflare's free plan where eligible; deployment/build quotas and Workers/D1/R2 storage limits still apply. Public GitHub source does not mean unlimited requests or Cloudflare builds.
