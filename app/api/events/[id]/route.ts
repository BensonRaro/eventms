import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const sessionHeaders = await headers();
    const session = await auth.api.getSession({ headers: sessionHeaders });

    const event = await prisma.event.findUnique({
      where: { id: id as string },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tickets: true,
        attendees: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendees: true,
            ticketPurchases: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (event.banned && session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "This event is currently unavailable." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
    });
  } catch (error) {
    console.error("Get event error", error);
    return NextResponse.json(
      { error: `"Unable to load event."${id}` },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const sessionHeaders = await headers();
    const session = await auth.api.getSession({ headers: sessionHeaders });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      banned,
      banReason,
    } = body as {
      name?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      location?: string;
      imageUrl?: string;
      categoryId?: string;
      price?: number;
      isFree?: boolean;
      url?: string;
      organizerId?: string;
      banned?: boolean;
      banReason?: string | null;
    };

    const isAdmin = session.user.role === "admin";
    const isStatusUpdate = banned !== undefined || banReason !== undefined;

    if (isStatusUpdate && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isStatusUpdate && (!name || !startDate || !endDate || !organizerId)) {
      return NextResponse.json(
        { error: "Missing required event fields." },
        { status: 400 },
      );
    }

    const event = await prisma.event.update({
      where: { id: (await params).id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined
          ? { description: description || null }
          : {}),
        ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: new Date(endDate) } : {}),
        ...(location !== undefined ? { location: location || null } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
        ...(price !== undefined
          ? { price: isFree ? 0 : Number(price ?? 0) }
          : {}),
        ...(isFree !== undefined ? { isFree: Boolean(isFree) } : {}),
        ...(url !== undefined ? { url: url || null } : {}),
        ...(organizerId !== undefined ? { organizerId } : {}),
        ...(banned !== undefined ? { banned: Boolean(banned) } : {}),
        ...(banReason !== undefined
          ? { banReason: banReason?.trim() || null }
          : {}),
      },
    });

    return NextResponse.json({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
    });
  } catch (error) {
    console.error("Update event error", error);
    return NextResponse.json(
      { error: "Unable to update event." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.event.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete event error", error);
    return NextResponse.json(
      { error: "Unable to delete event." },
      { status: 500 },
    );
  }
}
