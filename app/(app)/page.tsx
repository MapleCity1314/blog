import { getPosts } from "@/lib/posts";
import ScrollContainer from "@/components/home/scroll-container";

// 服务器组件：获取文章数据
export default function HomePage() {
  // 使用 RSC 优先原则：在服务器端获取数据
  const posts = getPosts();

  return <ScrollContainer posts={posts} />;
}