# Pawn to Professor — Appearance Manager Upgrade

This upgrade adds a complete browser-based design editor at:

`/admin/settings`

## What you can change

- Website name and tagline
- Homepage title and introduction
- Logo emoji or uploaded logo image
- Logo size
- Homepage hero/header photo
- Hero photo position and overlay
- Whole-site background image
- Background size and fixed/scroll behavior
- Main body font
- Heading font
- Primary, secondary, accent and background colors
- Card, text, border, header and footer colors
- Hero gradient colors
- Hero title and paragraph colors
- Website maximum width
- Card corner roundness
- Button corner roundness
- Hero height
- Hero text alignment
- Card shadows
- Show/hide decorative homepage chess piece
- Solid or glass header
- Sticky or non-sticky header
- Footer text
- Optional advanced custom CSS
- Reset to the original design
- Live preview before saving

## Easiest installation

1. Download the upgrade ZIP.
2. Unzip it.
3. Open your GitHub repository `PawntoProfessor/pawn-to-professor`.
4. Replace the project files with the files from this ZIP, keeping the same folder structure.
5. Commit the changes with a message such as `Add full Appearance Manager`.
6. Vercel will automatically build a new deployment.
7. Wait until the newest Vercel deployment says `Ready`.
8. Open your website and go to `/admin/settings`.

## Database

You do not need to delete or recreate Supabase.

The new Appearance Manager stores its settings in the existing `public.site_settings` table.

There is also an optional SQL file:

`supabase/appearance-migration.sql`

Running it is safe, but it is not required. The Appearance Manager will create the setting row when you first press Save Design.

## Image uploads

The Appearance Manager uploads logo, hero and background images into your existing public Supabase Storage bucket called `media`.

Because your admin account is already configured, the existing storage policies should allow these uploads.

## Important

Do not delete your Supabase project, database tables, Vercel environment variables or admin user.

This is an upgrade to the existing site, not a new installation.
