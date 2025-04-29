"use client";

import { Progress as ProgressComponent } from "@/components/ui/progress";
import { Button as ButtonComponent } from "@/components/ui/button";
import { Logo as LogoComponent } from "@/components/common/logo";

export function Progress(props: React.ComponentProps<typeof ProgressComponent>) {
  return <ProgressComponent {...props} />;
}

export function Button(props: React.ComponentProps<typeof ButtonComponent>) {
  return <ButtonComponent {...props} />;
}

export function Logo(props: React.ComponentProps<typeof LogoComponent>) {
  return <LogoComponent {...props} />;
}