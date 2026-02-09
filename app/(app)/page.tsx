import { getFirstFrame } from "@/lib/frames";
import { getPostSummaries } from "@/lib/posts";
import { getResourcesData } from "@/lib/data/resources";
import ScrollContainer from "@/components/home/scroll-container";

export default async function HomePage() {
  const [posts, firstFrame, resources] = await Promise.all([
    getPostSummaries(),
    getFirstFrame(),
    getResourcesData(),
  ]);
  const frames = firstFrame ? [firstFrame] : [];

  return <ScrollContainer posts={posts} frames={frames} resources={resources} />;
}
