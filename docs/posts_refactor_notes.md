# Posts Refactor Notes (MDX + Admin Ready)

## Current State
- Source: local `content/posts/*.mdx`
- Rendering: Server Components + `next-mdx-remote` with custom MDX components
- Caching: `use cache` + `cacheLife("max")` in list/detail loaders

## Future DB Migration Plan (PostgreSQL)
1. Create `posts` table with fields:
   - `id`, `slug`, `title`, `description`, `tags`, `mdx_content`
   - `status` (draft/published), `published_at`, `created_at`, `updated_at`
   - optional `cover`
2. Replace filesystem reads in `lib/posts.ts` with DB queries.
3. Keep MDX rendering pipeline unchanged:
   - load `mdx_content` from DB
   - render with `MDXRemote` + `useMDXComponents`
4. Add Admin CRUD to write MDX and update status.

## Non-Negotiables
- MDX components stay in `mdx-components.tsx`
- Rendering stays server-side
- No client-side MDX compilation
- `slug` remains stable canonical identifier
