"use server";

import { getAboutData } from "@/lib/data/about";

export async function getAboutDataAction() {
  return getAboutData();
}
