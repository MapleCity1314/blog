export type ResourceCategory = string;

export type ResourceCategoryFilter = "All" | ResourceCategory;

export type ResourceStatus = "Live" | "Curating" | "Drafting";

export type ResourceItem = {
  id: string;
  title: string;
  url: string;
  kind: ResourceCategory;
  status: ResourceStatus;
  summary: string;
  tags?: string[];
  image?: string;
};
