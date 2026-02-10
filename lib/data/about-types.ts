export type AboutProfile = {
  name: string;
  alias: string;
  role: string;
  location: string;
};

export type AboutHeroIntroPart = {
  text: string;
  highlight?: boolean;
};

export type AboutHeroMeta = {
  roleLabel: string;
  locationLabel: string;
};

export type AboutPartner = {
  myAvatar: string;
  partnerAvatar: string;
  alias1: string;
  alias2: string;
  startDate: string;
};

export type AboutSkillGroup = {
  category: string;
  items: string[];
};

export type AboutExperience = {
  id: string;
  role: string;
  company: string;
  period: string;
  desc: string;
};

export type AboutBlogSpecIcon = "cpu" | "layers" | "palette" | "monitor";

export type AboutBlogSpec = {
  label: string;
  value: string;
  icon: AboutBlogSpecIcon;
};

export type AboutBlog = {
  title: string;
  overviewTitle: string;
  overviewBody: string;
  buildStatusLabel: string;
  buildStatusValue: string;
  versionLabel: string;
  versionValue: string;
  specs: AboutBlogSpec[];
  footerLines: string[];
};

export type AboutData = {
  profile: AboutProfile;
  heroIntro: AboutHeroIntroPart[];
  heroMeta: AboutHeroMeta;
  partner: AboutPartner;
  skills: AboutSkillGroup[];
  experiences: AboutExperience[];
  blog: AboutBlog;
};
