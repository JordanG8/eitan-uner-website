import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "כניסה לעריכה",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only accept same-site paths, so ?next= can't be used as an open redirect.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/editor";
  return <LoginForm next={target} />;
}
