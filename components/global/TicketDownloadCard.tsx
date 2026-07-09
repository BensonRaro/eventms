"use client";

import { useState } from "react";
import { CalendarDays, Download, MapPin, Ticket } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

interface TicketPurchaseCardProps {
  purchase: {
    id: string;
    ticketName: string;
    quantity: number;
    amount: number;
    status: string;
    createdAt: Date | string;
    event: {
      id: string;
      name: string;
      description: string | null;
      startDate: Date | string;
      endDate: Date | string;
      location: string | null;
      imageUrl: string | null;
    };
    digitalTickets: Array<{
      id: string;
      ticketCode: string;
      qrPayload: string;
      issuedAt: Date | string;
    }>;
  };
  userName: string;
}

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "ticket";

export default function TicketDownloadCard({
  purchase,
  userName,
}: TicketPurchaseCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas is not supported in this browser.");
      }

      const gradient = ctx.createLinearGradient(0, 0, 1600, 0);
      gradient.addColorStop(0, "#2563eb");
      gradient.addColorStop(1, "#7c3aed");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1600, 900);

      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillRect(80, 80, 1440, 740);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(100, 100, 1400, 700);

      ctx.fillStyle = gradient;
      ctx.fillRect(100, 100, 1400, 220);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 54px sans-serif";
      ctx.fillText("EVENT TICKET", 140, 205);

      ctx.font = "500 28px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText("Digital pass", 140, 260);

      ctx.fillStyle = "#0f172a";
      ctx.font = "700 44px sans-serif";
      ctx.fillText(purchase.event.name, 140, 385);

      ctx.font = "500 26px sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText(
        purchase.event.description || "Enjoy your event experience.",
        140,
        440,
        900,
      );

      ctx.font = "600 24px sans-serif";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(`Guest: ${userName}`, 140, 520);
      ctx.fillText(`Ticket: ${purchase.ticketName}`, 140, 565);
      ctx.fillText(`Qty: ${purchase.quantity}`, 140, 610);
      ctx.fillText(`Amount: ${formatCurrency(purchase.amount)}`, 140, 655);

      ctx.fillText(`Issued: ${formatDate(purchase.createdAt)}`, 140, 700);

      const ticketCode =
        purchase.digitalTickets?.[0]?.ticketCode || purchase.id.toUpperCase();
      ctx.fillText(`Code: ${ticketCode}`, 140, 745);

      const qrPayload =
        purchase.digitalTickets?.[0]?.qrPayload ||
        `${purchase.id}:${purchase.event.id}`;
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 260,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      const qrImage = new Image();
      qrImage.src = qrDataUrl;
      await new Promise<void>((resolve, reject) => {
        qrImage.onload = () => resolve();
        qrImage.onerror = reject;
      });

      ctx.drawImage(qrImage, 1180, 430, 240, 240);

      ctx.fillStyle = "#0f172a";
      ctx.font = "600 24px sans-serif";
      ctx.fillText("Scan at the venue", 1200, 720);

      const link = document.createElement("a");
      link.download = `${slugify(purchase.event.name)}-${ticketCode.toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error(error);
      alert("Unable to download your ticket right now.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {purchase.event.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(purchase.event.startDate)}
              </span>
              {purchase.event.location ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {purchase.event.location}
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-muted px-3 py-1 text-foreground">
                {purchase.ticketName}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-foreground">
                {purchase.quantity} ticket{purchase.quantity > 1 ? "s" : ""}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700">
                {purchase.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(purchase.amount)}
          </p>
          <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Preparing…" : "Download PNG"}
          </Button>
        </div>
      </div>
    </div>
  );
}
