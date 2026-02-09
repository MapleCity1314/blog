import { AboutExperience } from "@/components/about/about-experience";
import { AboutHero } from "@/components/about/about-hero";
import { AboutSkills } from "@/components/about/about-skills";
import { AboutBlog } from "@/components/about/about-blog";
import AmbientBackground from "@/components/ambient-background";
import { getAboutDataAction } from "./actions";

export default async function AboutPage() {
  const data = await getAboutDataAction();

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
      <AmbientBackground />

      <main className="max-w-5xl mx-auto px-6 py-20 lg:py-32 flex flex-col gap-24">
        <AboutHero
          profile={data.profile}
          partner={data.partner}
          avatarSrc="/static/avatar.jpg"
          intro={data.heroIntro}
          meta={data.heroMeta}
        />

        <AboutBlog data={data.blog} />

        <AboutSkills skills={data.skills} />

        <AboutExperience experiences={data.experiences} />
      </main>
    </div>
  );
}
