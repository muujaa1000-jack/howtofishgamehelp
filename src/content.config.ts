import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const sourceSchema = z.object({
  title: z.string().min(3),
  url: z.url(),
  type: z.enum(['official-store', 'official-patch', 'official-achievement', 'official-doc', 'gameplay-guide', 'gameplay-video', 'community-thread']),
  accessedAt: z.coerce.date(),
  notes: z.string().optional(),
});

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(10).max(72),
    description: z.string().min(70).max(165),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    category: z.enum(['guides', 'walkthrough', 'islands', 'bosses', 'items', 'achievements', 'fixes']),
    primaryIntent: z.string().min(10),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    lastVerifiedAt: z.coerce.date(),
    gameVersion: z.string().default('Unknown'),
    lastSourceReview: z.coerce.date().optional(),
    evidenceThroughVersion: z.string().default('Unknown'),
    firstHandTested: z.boolean().default(false),
    patchSensitive: z.boolean().default(true),
    adEligible: z.boolean().default(false),
    verificationStatus: z.enum(['official', 'community-confirmed', 'mixed', 'needs-review']),
    sources: z.array(sourceSchema).min(1),
    previousGuide: z.string().nullable().default(null),
    nextGuide: z.string().nullable().default(null),
    relatedGuides: z.array(z.string()).min(1).max(5),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    answer: z.string().min(60).max(700),
    featured: z.boolean().default(false),
    priority: z.enum(['P0', 'P1', 'P2']).default('P1'),
  }).refine((data) => data.updatedAt >= data.publishedAt, {
    message: 'updatedAt cannot be earlier than publishedAt',
  }).refine((data) => data.verificationStatus !== 'needs-review' || data.noindex, {
    message: 'needs-review entries must be noindex',
  }).refine((data) => !data.adEligible || (!data.draft && !data.noindex), {
    message: 'adEligible entries must be public and indexable',
  }),
});

export const collections = { guides };
