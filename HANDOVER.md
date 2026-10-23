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
| Content + images | Vercel Blob store `eitan-uner-content`, inside the Vercel team | Jordan's team |
| Editor password | regenerate on his side (below) | Jordan |

Nothing else. There is no CMS account, no database login, no separate media
service, no per-seat licence, and no API key belonging to a vendor. The Blob
store is part of the Vercel account he already gets.

## Runtime dependencies

```
lexical, @lexical/*   MIT   the editor (Meta's), npm packages — no account, no service
@vercel/blob          Apache-2.0  client for the storage that lives in his Vercel project
next / react                framework
```

Lexical is a component in this repo's `node_modules`, not a SaaS product; if
the project were abandoned tomorrow the site keeps working and the editor
keeps running.

## Steps

1. **Transfer the GitHub repo** to Eitan's account (or his org).
2. **Transfer the Vercel project** to his Vercel account. Vercel keeps the
   deployment history and the domain attachment.
3. **Move the content store.** Check Vercel → Storage that `eitan-uner-content`
   came across with the project and is still connected (the project should
   still have `BLOB_READ_WRITE_TOKEN`). If it did not move, create a Blob store
   in his account, connect it, and copy the `content/` and `media/` folders
   across (`vercel blob` CLI, or a short script with `@vercel/blob` `list` +
   `put`) before he edits anything. Uploaded image URLs point at the store, so
   media must be copied, not re-uploaded.
4. **Re-add the environment variables** on his side — env vars do *not* always
   survive a transfer, and you want a password he owns anyway:
   ```bash
   npx tsx scripts/set-password.mts "his-new-password"
   ```
   Put `AUTH_SECRET` and `EDITOR_PASSWORD_HASH` into his Vercel project, give him
   the password directly, and delete any copy you hold.
5. **Redeploy.** Env vars only take effect on a new deployment.
6. **Point DNS** at his Vercel project (see the README's cutover section).
7. **Delete `PRODUCTION-CREDENTIALS.local.md`** from your machine if it is still
   there.

## Keep it this way

When picking anything new, prefer the option that adds no account Eitan would
not control. Storage follows this rule: the Blob store lives inside the Vercel
project he gets anyway, so there is no database or media service to hand over.

If he ever stops working with Jordan, he should be able to keep the site running
by himself, with nothing to cancel and nobody to ask.
