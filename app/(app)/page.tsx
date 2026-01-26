import { getPostSummaries } from "@/lib/posts";
import ScrollContainer from "@/components/home/scroll-container";

// 服务器组件：获取文章数据
export default async function HomePage() {
  const posts = await getPostSummaries();

  return <ScrollContainer posts={posts} />;
}
