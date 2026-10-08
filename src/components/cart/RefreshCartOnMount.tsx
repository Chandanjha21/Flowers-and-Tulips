"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** After a successful payment the server empties the bag; pull that into the header/drawer. */
export function RefreshCartOnMount() {
  const { refresh } = useCart();
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return null;
}
