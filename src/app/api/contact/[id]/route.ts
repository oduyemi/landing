import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import Contact from "@/models/contact.model";
import { getCurrentUser } from "@/utils/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const contact = await Contact.findById(id)
      .populate(
        "treatedBy",
        "fullname email role image"
      );

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact entry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contact entry",
      },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = await req.json();

    const update: Record<string, any> = {
      ...body,
    };

    if (body.status === "treated") {
      update.treatedAt = new Date();
      update.treatedBy = user._id;
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "treatedBy",
      "fname lname email role"
    );

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact entry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update contact entry",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const contact =
      await Contact.findByIdAndDelete(id);

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact entry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact entry deleted",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete contact entry",
      },
      { status: 500 }
    );
  }
}