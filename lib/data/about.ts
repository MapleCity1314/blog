import "server-only";

import { cache } from "react";
import { cacheLife } from "next/cache";
import type { AboutData } from "./about-types";
import { ABOUT_DATA } from "./about-data";
import { db } from "@/lib/db";
import { about } from "@/lib/db/schema";

export {
  type AboutData,
  type AboutBlog,
  type AboutBlogSpecIcon,
} from "./about-types";
export type * from "./about-types";

export const getAboutData = cache(async () => {
  "use cache";
  cacheLife("hours");
  const rows = await db
    .select({
      profile: about.profile,
      heroIntro: about.heroIntro,
      heroMeta: about.heroMeta,
      partner: about.partner,
      skills: about.skills,
      experiences: about.experiences,
      blog: about.blog,
    })
    .from(about)
    .limit(1);

  const data = rows[0];
  if (!data) {
    return ABOUT_DATA as AboutData;
  }

  return {
    profile: data.profile,
    heroIntro: data.heroIntro,
    heroMeta: data.heroMeta,
    partner: data.partner,
    skills: data.skills,
    experiences: data.experiences,
    blog: data.blog,
  } as AboutData;
});
