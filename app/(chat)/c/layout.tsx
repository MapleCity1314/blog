import ChatShell from "./chat-shell";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatShell>{children}</ChatShell>;
}

