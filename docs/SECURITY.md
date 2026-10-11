# Family privacy and preview security

This release is a **static demonstration**. The URL is NOT private simply because it is obscure or absent from search engines.

- `X-Robots-Tag`, `robots.txt` and `noindex` reduce discovery, but do not prevent access.
- Protect **all public hosts**, including `*.pages.dev` and `adventurebook.anevum.com`, with identity-based access controls if you need a private preview.
- App content is stored in **each visitor's own browser localStorage**. It does not synchronize. Deleting browser storage may delete it. Exporting a JSON save does not create automatic backups.
- Local demo profiles are not real identities or authenticated accounts. A new profile in the prototype does not invite a relative.
- Do not store medical details, children's photos, location histories, passwords or irreplaceable memories in the demo.
- Before shared use: implement session security, guardian roles, invite revocation, object-level permissions, family isolation, media access policies, data export/deletion, backups, restoration tests, and incident-handling procedures.
- Do not put API credentials or family data in `public/`. Everything there is published as website content.