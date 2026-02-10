"use client";

import React from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { SystemInput } from "@/components/ui/system-input";
import type {
  AboutBlogSpecIcon,
  AboutData,
  AboutExperience,
  AboutHeroIntroPart,
  AboutSkillGroup,
} from "@/lib/data/about-types";

type AboutDataFormProps = {
  initialData: AboutData;
  action: (formData: FormData) => void | Promise<void>;
};

const BLOG_SPEC_ICONS: AboutBlogSpecIcon[] = [
  "cpu",
  "layers",
  "palette",
  "monitor",
];

const emptyHeroIntro = (): AboutHeroIntroPart => ({
  text: "",
  highlight: false,
});

const emptySkillGroup = (): AboutSkillGroup => ({
  category: "",
  items: [""],
});

const emptyExperience = (): AboutExperience => ({
  id: newId(),
  role: "",
  company: "",
  period: "",
  desc: "",
});

function newId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `exp_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function AboutDataForm({ initialData, action }: AboutDataFormProps) {
  const [data, setData] = React.useState<AboutData>(initialData);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const aboutJson = React.useMemo(() => JSON.stringify(data), [data]);

  return (
    <form
      action={action}
      className="space-y-10 border border-border/40 bg-background/20 p-6"
    >
      <input type="hidden" name="redirect_to" value="/admin/settings" />
      <input type="hidden" name="about_json" value={aboutJson} readOnly />

      <Section title="Profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemInput
            label="Name"
            value={data.profile.name}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                profile: { ...prev.profile, name: event.target.value },
              }))
            }
          />
          <SystemInput
            label="Alias"
            value={data.profile.alias}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                profile: { ...prev.profile, alias: event.target.value },
              }))
            }
          />
          <SystemInput
            label="Role"
            value={data.profile.role}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                profile: { ...prev.profile, role: event.target.value },
              }))
            }
          />
          <SystemInput
            label="Location"
            value={data.profile.location}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                profile: { ...prev.profile, location: event.target.value },
              }))
            }
          />
        </div>
      </Section>

      <Section title="Hero Intro">
        <div className="space-y-4">
          {data.heroIntro.map((part, index) => (
            <div
              key={`hero-${index}`}
              className="flex flex-col gap-3 border border-border/40 bg-background/40 p-4"
            >
              <SystemInput
                label={`Line ${index + 1}`}
                value={part.text}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    heroIntro: prev.heroIntro.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, text: event.target.value }
                        : item
                    ),
                  }))
                }
              />
              <label className="flex items-center gap-3 text-[10px] font-mono uppercase text-muted-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(part.highlight)}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      heroIntro: prev.heroIntro.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, highlight: event.target.checked }
                          : item
                      ),
                    }))
                  }
                  className="h-4 w-4 border border-border/70 bg-background"
                />
                Highlight text segment
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      heroIntro: prev.heroIntro.filter(
                        (_, itemIndex) => itemIndex !== index
                      ),
                    }))
                  }
                  className="inline-flex items-center gap-2 border border-border/50 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground touch-manipulation"
                  aria-label={`Remove hero intro line ${index + 1}`}
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                heroIntro: [...prev.heroIntro, emptyHeroIntro()],
              }))
            }
            className="inline-flex items-center gap-2 border border-dashed border-border/60 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            <Plus size={12} /> Add intro line
          </button>
        </div>
      </Section>

      <Section title="Hero Meta">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemInput
            label="Role Label"
            value={data.heroMeta.roleLabel}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                heroMeta: { ...prev.heroMeta, roleLabel: event.target.value },
              }))
            }
          />
          <SystemInput
            label="Location Label"
            value={data.heroMeta.locationLabel}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                heroMeta: {
                  ...prev.heroMeta,
                  locationLabel: event.target.value,
                },
              }))
            }
          />
        </div>
      </Section>

      <Section title="Partner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemInput
            label="My Avatar URL"
            value={data.partner.myAvatar}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                partner: { ...prev.partner, myAvatar: event.target.value },
              }))
            }
          />
          <SystemInput
            label="Partner Avatar URL"
            value={data.partner.partnerAvatar}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                partner: { ...prev.partner, partnerAvatar: event.target.value },
              }))
            }
          />
          <SystemInput
            label="Alias 1"
            value={data.partner.alias1}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                partner: { ...prev.partner, alias1: event.target.value },
              }))
            }
          />
          <SystemInput
            label="Alias 2"
            value={data.partner.alias2}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                partner: { ...prev.partner, alias2: event.target.value },
              }))
            }
          />
          <SystemInput
            label="Start Date (ISO)"
            value={data.partner.startDate}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                partner: { ...prev.partner, startDate: event.target.value },
              }))
            }
            placeholder="2025-05-24T20:00:00+08:00"
          />
        </div>
      </Section>

      <Section title="Skills">
        <div className="space-y-4">
          {data.skills.map((group, index) => (
            <div
              key={`skills-${index}`}
              className="space-y-4 border border-border/40 bg-background/40 p-4"
            >
              <SystemInput
                label="Category"
                value={group.category}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    skills: prev.skills.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, category: event.target.value }
                        : item
                    ),
                  }))
                }
              />
              <div className="space-y-3">
                {group.items.map((item, itemIndex) => (
                  <div key={`skill-${index}-${itemIndex}`} className="flex gap-2">
                    <SystemInput
                      label={`Item ${itemIndex + 1}`}
                      value={item}
                      onChange={(event) =>
                        setData((prev) => ({
                          ...prev,
                          skills: prev.skills.map((skill, skillIndex) =>
                            skillIndex === index
                              ? {
                                  ...skill,
                                  items: skill.items.map((value, valueIndex) =>
                                    valueIndex === itemIndex
                                      ? event.target.value
                                      : value
                                  ),
                                }
                              : skill
                          ),
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          skills: prev.skills.map((skill, skillIndex) =>
                            skillIndex === index
                              ? {
                                  ...skill,
                                  items: skill.items.filter(
                                    (_, valueIndex) => valueIndex !== itemIndex
                                  ),
                                }
                              : skill
                          ),
                        }))
                      }
                      className="self-stretch px-3 border border-border/50 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                      aria-label={`Remove skill item ${itemIndex + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      skills: prev.skills.map((skill, skillIndex) =>
                        skillIndex === index
                          ? { ...skill, items: [...skill.items, ""] }
                          : skill
                      ),
                    }))
                  }
                  className="inline-flex items-center gap-2 border border-dashed border-border/60 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                >
                  <Plus size={12} /> Add item
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      skills: prev.skills.filter(
                        (_, skillIndex) => skillIndex !== index
                      ),
                    }))
                  }
                  className="inline-flex items-center gap-2 border border-border/50 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                  aria-label={`Remove skill group ${group.category || index + 1}`}
                >
                  <Trash2 size={12} /> Remove group
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                skills: [...prev.skills, emptySkillGroup()],
              }))
            }
            className="inline-flex items-center gap-2 border border-dashed border-border/60 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            <Plus size={12} /> Add skill group
          </button>
        </div>
      </Section>

      <Section title="Experiences">
        <div className="space-y-4">
          {data.experiences.map((experience, index) => (
            <div
              key={experience.id || `exp-${index}`}
              className="space-y-4 border border-border/40 bg-background/40 p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SystemInput
                  label="ID"
                  value={experience.id}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, id: event.target.value }
                          : item
                      ),
                    }))
                  }
                />
                <SystemInput
                  label="Role"
                  value={experience.role}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, role: event.target.value }
                          : item
                      ),
                    }))
                  }
                />
                <SystemInput
                  label="Company"
                  value={experience.company}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, company: event.target.value }
                          : item
                      ),
                    }))
                  }
                />
                <SystemInput
                  label="Period"
                  value={experience.period}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, period: event.target.value }
                          : item
                      ),
                    }))
                  }
                />
              </div>
              <SystemTextarea
                label="Description"
                value={experience.desc}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    experiences: prev.experiences.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, desc: event.target.value }
                        : item
                    ),
                  }))
                }
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      experiences: prev.experiences.filter(
                        (_, itemIndex) => itemIndex !== index
                      ),
                    }))
                  }
                  className="inline-flex items-center gap-2 border border-border/50 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                  aria-label={`Remove experience ${experience.id || index + 1}`}
                >
                  <Trash2 size={12} /> Remove experience
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                experiences: [...prev.experiences, emptyExperience()],
              }))
            }
            className="inline-flex items-center gap-2 border border-dashed border-border/60 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            <Plus size={12} /> Add experience
          </button>
        </div>
      </Section>

      <Section title="Blog">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SystemInput
              label="Title"
              value={data.blog.title}
              onChange={(event) =>
                setData((prev) => ({
                  ...prev,
                  blog: { ...prev.blog, title: event.target.value },
                }))
              }
            />
            <SystemInput
              label="Overview Title"
              value={data.blog.overviewTitle}
              onChange={(event) =>
                setData((prev) => ({
                  ...prev,
                  blog: { ...prev.blog, overviewTitle: event.target.value },
                }))
              }
            />
          </div>
          <SystemTextarea
            label="Overview Body"
            value={data.blog.overviewBody}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                blog: { ...prev.blog, overviewBody: event.target.value },
              }))
            }
            rows={4}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SystemInput
              label="Build Status Label"
              value={data.blog.buildStatusLabel}
              onChange={(event) =>
                setData((prev) => ({
                  ...prev,
                  blog: { ...prev.blog, buildStatusLabel: event.target.value },
                }))
              }
            />
            <SystemInput
              label="Build Status Value"
              value={data.blog.buildStatusValue}
              onChange={(event) =>
                setData((prev) => ({
                  ...prev,
                  blog: { ...prev.blog, buildStatusValue: event.target.value },
                }))
              }
            />
            <SystemInput
              label="Version Label"
              value={data.blog.versionLabel}
              onChange={(event) =>
                setData((prev) => ({
                  ...prev,
                  blog: { ...prev.blog, versionLabel: event.target.value },
                }))
              }
            />
            <SystemInput
              label="Version Value"
              value={data.blog.versionValue}
              onChange={(event) =>
                setData((prev) => ({
                  ...prev,
                  blog: { ...prev.blog, versionValue: event.target.value },
                }))
              }
            />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">
              Specs
            </p>
            {data.blog.specs.map((spec, index) => (
              <div
                key={`spec-${index}`}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_auto] gap-3 border border-border/40 bg-background/40 p-4"
              >
                <SystemInput
                  label="Label"
                  value={spec.label}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      blog: {
                        ...prev.blog,
                        specs: prev.blog.specs.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, label: event.target.value }
                            : item
                        ),
                      },
                    }))
                  }
                />
                <SystemInput
                  label="Value"
                  value={spec.value}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      blog: {
                        ...prev.blog,
                        specs: prev.blog.specs.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, value: event.target.value }
                            : item
                        ),
                      },
                    }))
                  }
                />
                <label className="flex flex-col gap-2 text-[10px] font-mono uppercase text-muted-foreground">
                  Icon
                  <select
                    value={spec.icon}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        blog: {
                          ...prev.blog,
                          specs: prev.blog.specs.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  icon: event.target.value as AboutBlogSpecIcon,
                                }
                              : item
                          ),
                        },
                      }))
                    }
                    className="h-11 border border-border/60 bg-background/60 px-3 text-xs font-mono uppercase tracking-widest text-foreground"
                  >
                    {BLOG_SPEC_ICONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        blog: {
                          ...prev.blog,
                          specs: prev.blog.specs.filter(
                            (_, itemIndex) => itemIndex !== index
                          ),
                        },
                      }))
                    }
                    className="inline-flex items-center gap-2 border border-border/50 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                    aria-label={`Remove spec ${spec.label || index + 1}`}
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  blog: {
                    ...prev.blog,
                    specs: [
                      ...prev.blog.specs,
                      { label: "", value: "", icon: "cpu" },
                    ],
                  },
                }))
              }
              className="inline-flex items-center gap-2 border border-dashed border-border/60 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            >
              <Plus size={12} /> Add spec
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">
              Footer Lines
            </p>
            {data.blog.footerLines.map((line, index) => (
              <div key={`footer-${index}`} className="flex gap-2">
                <SystemInput
                  label={`Line ${index + 1}`}
                  value={line}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      blog: {
                        ...prev.blog,
                        footerLines: prev.blog.footerLines.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? event.target.value
                              : item
                        ),
                      },
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      blog: {
                        ...prev.blog,
                        footerLines: prev.blog.footerLines.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      },
                    }))
                  }
                  className="self-stretch px-3 border border-border/50 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                  aria-label={`Remove footer line ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  blog: {
                    ...prev.blog,
                    footerLines: [...prev.blog.footerLines, ""],
                  },
                }))
              }
              className="inline-flex items-center gap-2 border border-dashed border-border/60 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            >
              <Plus size={12} /> Add footer line
            </button>
          </div>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
        <p className="text-[10px] font-mono uppercase text-muted-foreground">
          Update About data using field-level controls. Saves write to database.
        </p>
        <button className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-widest hover:bg-primary transition-all touch-manipulation">
          <Save size={16} /> Save_About
        </button>
      </div>
    </form>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

type SystemTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

function SystemTextarea({
  label,
  className,
  ...props
}: SystemTextareaProps) {
  const placeholderValue = props.placeholder ?? " ";

  return (
    <div className="relative w-full group">
      <textarea
        {...props}
        placeholder={placeholderValue}
        className={[
          "peer w-full bg-background/50 border border-border/60 px-4 py-3 text-sm font-mono tracking-wider outline-none transition-all",
          "focus:border-primary/50 focus:bg-background/80",
          "placeholder-transparent resize-y",
          className ?? "",
        ].join(" ")}
      />
      <label
        className={[
          "absolute left-3 -top-2.5 px-2 bg-background text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-all",
          "peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:bg-transparent",
          "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[10px] peer-focus:text-primary peer-focus:bg-background",
          "pointer-events-none",
        ].join(" ")}
      >
        {label}
      </label>
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary transition-all duration-300 peer-focus:w-full" />
    </div>
  );
}
