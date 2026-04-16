import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ENSO BRAIN — Dashboard",
  description: "Your mindful dashboard — focus, tasks, goals, and journal in one place.",
};

export default function BrainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
