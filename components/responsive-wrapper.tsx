"use client";

import { ReactNode } from 'react';
import { useDeviceType } from '@/hooks/use-device-type';

interface Props {
  children: ReactNode;
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
}

export function ResponsiveWrapper({ children, mobile, tablet, desktop }: Props) {
  const deviceType = useDeviceType();

  if (deviceType === 'mobile' && mobile) return <>{mobile}</>;
  if (deviceType === 'tablet' && tablet) return <>{tablet}</>;
  if (deviceType === 'desktop' && desktop) return <>{desktop}</>;

  return <>{children}</>;
}

export function MobileOnly({ children }: { children: ReactNode }) {
  const deviceType = useDeviceType();
  return deviceType === 'mobile' ? <>{children}</> : null;
}

export function TabletOnly({ children }: { children: ReactNode }) {
  const deviceType = useDeviceType();
  return deviceType === 'tablet' ? <>{children}</> : null;
}

export function DesktopOnly({ children }: { children: ReactNode }) {
  const deviceType = useDeviceType();
  return deviceType === 'desktop' ? <>{children}</> : null;
}