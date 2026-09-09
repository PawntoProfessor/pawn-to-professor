# Pawn to Professor — Simple Setup Guide

You do **not** need to run your own mail server. This first version has no email server at all.

## What you need
- GitHub account — stores the website code
- Supabase account — stores sections/pages, admin login, and uploaded images/PDFs
- Vercel account — hosts the website
- Your domain: `pawntoprofessor.com`

## A. Put the code on GitHub
1. Create a new GitHub repository named `pawn-to-professor`.
2. Upload all files from this project folder.
3. Keep the repository private if you prefer. Vercel can still deploy it when connected.

You normally do not need to return to GitHub after setup.

## B. Create the Supabase database
1. Create a new project at Supabase.
2. Open **SQL Editor**.
3. Open this project file: `supabase/schema.sql`.
4. Copy all of it into Supabase SQL Editor and press **Run**.

This creates:
- sections and sub-sections
- pages/resources
- website settings
- admin profile roles
- Media Library storage
- Trash support

## C. Create your admin login
1. In Supabase open **Authentication > Users**.
2. Create your own user with your email and password.
3. Copy this SQL into SQL Editor, replacing the email with your real login email:

```sql
insert into public.profiles(id, display_name, role)
select id, 'Site Owner', 'admin'
from auth.users
where email = 'YOUR-EMAIL@example.com'
on conflict (id) do update set role='admin';
```

## D. Copy the two Supabase keys
In Supabase open **Project Settings > API** and copy:
- Project URL
- Publishable / anon key

Do NOT copy a service-role secret into this website.

## E. Deploy with Vercel
1. In Vercel choose **Add New > Project**.
2. Import your `pawn-to-professor` GitHub repository.
3. Framework should be detected as **Next.js**.
4. Add these Environment Variables:

```text
NEXT_PUBLIC_SITE_URL=https://pawntoprofessor.com
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

5. Press **Deploy**.

## F. Connect pawntoprofessor.com
1. In Vercel open the project.
2. Open **Settings > Domains**.
3. Add `pawntoprofessor.com`.
4. Add `www.pawntoprofessor.com` too.
5. Vercel will display the DNS records you must add at the company where you bought the domain.
6. Use the exact DNS values Vercel shows. Do not guess them.
7. Make `pawntoprofessor.com` the main domain and redirect `www` to it.

## G. Daily use
Open:

`https://pawntoprofessor.com/admin`

You can then manage the site from your browser.

### Site Manager
- Add a main section
- Add unlimited sub-sections
- Rename a section
- Move sections up/down
- Show/hide sections
- Add pages
- Add lessons
- Add flashcard resources
- Add worksheets
- Add PDFs
- Add external web links
- Add HTML5 game links

### Media Library
Upload images and PDFs, press **Copy URL**, and paste that URL into a page's Thumbnail field or resource link.

### Website Settings
Change:
- website name
- logo symbol
- tagline
- homepage big title
- homepage introduction

### Trash
Deleting from Site Manager only moves the item to Trash. Restore it if you make a mistake.

## H. Add your existing Taiwan EFL Lesson Planner
In **Admin > Site Manager > Pages & Resources**:
1. Press **Add new**.
2. Title: `Taiwan EFL Lesson Planner`.
3. Choose the section `Lessons` or `Teacher Resources`.
4. Type: `Web Link`.
5. Paste your Vercel lesson planner URL into **Game / PDF / external link**.
6. Save.

Later the two applications can be merged more deeply, but this gives you one central hub immediately.

## I. Adding an HTML5 game
After you host an HTML5 game online:
1. Admin > Site Manager.
2. Pages & Resources.
3. Add new.
4. Type: **HTML5 Game**.
5. Paste the game's public URL.
6. Add title, description, grade and thumbnail.
7. Save.

The game then appears on the public website.

## Recommended later upgrades
Once this version is running well, add these one at a time:
1. Drag-and-drop section ordering.
2. Rich text editor for lesson pages.
3. Dedicated visual flashcard builder.
4. Lesson → flashcards → worksheet → game relationships.
5. English / Traditional Chinese fields.
6. Search and grade/topic filters.
7. Student Mode / Teacher Mode.
8. Automatic backups and audit history.

Do not add all of these before the basic site is working. The current version is intentionally simple enough to operate yourself.
