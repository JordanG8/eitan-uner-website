# Handover — transferring this site to Eitan

**Design goal: Eitan owns everything.** Every choice in this project was checked
against one question — *can this move to his accounts without a rewrite, and does
it force him to depend on someone else's?* That is why there is no hosted CMS.

## What has to move

| Asset | How it transfers | Owner today |
| --- | --- | --- |
| GitHub repo | Settings → Transfer ownership, or fork to his org | Jordan |
| Vercel project | Vercel → Project Settings → Transfer to another account | Jordan's team |
| Domain `eitanuner.co.il` | already his; DNS at enter-system.com | Eitan |
| Content + images | in the repo — moves with it, no export step | — |
| Editor password | regenerate on his side (below) | Jordan |

Nothing else. There is no CMS account, no database login, no media service, no
per-seat licence, and no API key belonging to a vendor.

## Runtime dependencies

```
@measured/puck   MIT   the visual editor, an npm package — no account, no service
next / react           framework
```

That's the whole list. Puck is a component in this repo's `node_modules`, not a
SaaS product; if the project were abandoned tomorrow the site keeps working and
the editor keeps running.

## Steps

1. **Transfer the GitHub repo** to Eitan's account (or his org).
2. **Transfer the Vercel project** to his Vercel account. Vercel keeps the
   deployment history and the domain attachment.
3. **Re-add the environment variables** on his side — env vars do *not* always
   survive a transfer, and you want a password he owns anyway:
   ```bash
   npx tsx scripts/set-password.mts "his-new-password"
   ```
   Put `AUTH_SECRET` and `EDITOR_PASSWORD_HASH` into his Vercel project, give him
   the password directly, and delete any copy you hold.
4. **Redeploy.** Env vars only take effect on a new deployment.
5. **Point DNS** at his Vercel project (see the README's cutover section).
6. **Delete `PRODUCTION-CREDENTIALS.local.md`** from your machine if it is still
   there.

## Keep it this way

When picking anything new — storage in particular — prefer the option that adds
no account Eitan would not control. Between the storage choices in the README:

- **commit-back-to-repo** adds nothing; the repo he already owns *is* the store.
- **Postgres + R2** is technically nicer but adds two more logins to hand over
  and two more bills in his name.

If he ever stops working with Jordan, he should be able to keep the site running
by himself, with nothing to cancel and nobody to ask.
