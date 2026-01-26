"use client";

import { Cpu } from "lucide-react";
import { SectionTitle } from "@/components/about/section-title";

type Skill = {
  category: string;
  items: string[];
};

type AboutSkillsProps = {
  skills: Skill[];
};

export function AboutSkills({ skills }: AboutSkillsProps) {
  return (
    <section>
      <SectionTitle title="Neural_Modules (Tech Stack)" icon={<Cpu size={16} />} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.category}
            className="p-5 rounded-xl border border-border bg-background/30 hover:border-primary/50 transition-all group"
          >
            <h3 className="text-sm font-bold font-mono uppercase text-muted-foreground mb-4 group-hover:text-primary transition-colors">
              {skill.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <span
                  key={item}
                  className="px-2 py-1 rounded-md bg-muted/50 text-xs font-medium border border-transparent hover:border-border transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
