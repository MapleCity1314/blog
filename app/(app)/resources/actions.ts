"use server";

import { getResourcesData } from "@/lib/data/resources";

export async function getResourcesDataAction() {
  return getResourcesData();
}
