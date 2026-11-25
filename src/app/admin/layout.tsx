import type { Metadata } from "next";
import AdminShell from "./adminShell";

export const metadata: Metadata = {
  title: "Admin — Challenge Store",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
