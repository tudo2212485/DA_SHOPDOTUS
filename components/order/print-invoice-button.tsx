"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintInvoiceButton() {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      <Printer className="mr-2 h-4 w-4" />
      In hóa đơn
    </Button>
  );
}
