# SS PLAY setup notes

## Existing deployment
- `index.html` is the public website.
- `app.js` loads published rows from `public.content` in Supabase.
- `admin.html` and `admin.js` are the admin panel.
- `config.js` contains the Supabase project URL and browser-safe publishable key.

## Important
Your current Supabase project has already been configured. Do not rerun `supabase-schema.sql` on that existing project. The file is a reference for a new project only.
Never place a Supabase secret/service_role key in GitHub or browser code.

## Publish content
In the admin panel, add a title, choose `movie`, `series`, `short`, or `live`, and set status to `published`. Add a poster URL and a video URL only if you have rights to distribute that content. Published movies/shorts/live items appear in Featured Movies; published series appear in Web Series.

Premium playback is deliberately not unlocked until a subscription and payment-verification system is implemented. This package does not enable payments or claim DRM/secure video hosting.
