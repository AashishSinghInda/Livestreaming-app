"use client";

import { usePathname } from "next/navigation";
import Header from "../app/common/Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const hideHeaderRoutes = ["/login", "/register"];
  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  if (shouldHideHeader) return null;
  return <Header />;
}