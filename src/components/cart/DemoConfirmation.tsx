"use client";

import { useSyncExternalStore } from "react";
import { Confirmation, type ConfirmationView } from "./Confirmation";

export const DEMO_ORDER_KEY = "ft_demo_order";

const subscribe = () => () => {};
const read = () => {
  try {
    return window.sessionStorage.getItem(DEMO_ORDER_KEY);
  } catch {
    return null;
  }
};

/** Frontend-only mode: shows the demo order the checkout form stored in this tab. */
export function DemoConfirmation() {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  let view: ConfirmationView | null = null;
  try {
    view = raw ? (JSON.parse(raw) as ConfirmationView) : null;
  } catch {
    view = null;
  }
  return <Confirmation view={view} />;
}
