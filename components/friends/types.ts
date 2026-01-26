export type Friend = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  url: string;
  desc: string;
  color: string;
  createdAt: string;
};

export type AccessStatus = {
  state: "idle" | "checking" | "approved" | "rejected";
  message?: string;
};
