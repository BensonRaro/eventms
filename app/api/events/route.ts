import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      imageUrl,
      categoryId,
      price,
      isFree,
      url,
      organizerId,
    } = body as {
      name: string;
      description?: string;
      startDate: string;
      endDate: string;
      location?: string;
      imageUrl?: string;
      categoryId?: string;
      price?: number;
      isFree?: boolean;
      url?: string;
      organizerId: string;
    };

    if (!name || !startDate || !endDate || !organizerId) {
      return NextResponse.json(
        { error: "Missing required event fields." },
        { status: 400 },
      );
    }

    const event = await prisma.event.create({
      data: {
        id: crypto.randomBytes(12).toString("hex"),
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || null,
        imageUrl: imageUrl || null,
        categoryId: categoryId || null,
        price: isFree ? 0 : Number(price ?? 0),
        isFree: Boolean(isFree),
        url: url || null,
        organizerId,
      },
    });

    return NextResponse.json(
      {
        ...event,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create event error", error);
    return NextResponse.json(
      { error: "Unable to create event." },
      { status: 500 },
    );
  }
}
