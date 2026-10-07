import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import Contact from "@/models/contact.model";
import { sendEmailWithRetry } from "@/helper/emailLogic";

/**
 * GET CONTACT ENTRIES
 *
 * Examples:
 * /api/contact
 * /api/contact?status=pending
 * /api/contact?status=treated
 * /api/contact?topic=General
 * /api/contact?topic=Other
 * /api/contact?status=pending&topic=Software Development
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const topic = searchParams.get("topic");

    const filter: Record<string, string> = {};

    if (status) {
      filter.status = status;
    }

    if (topic) {
      filter.topic = topic;
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contact entries",
      },
      { status: 500 }
    );
  }
}

/**
 * CREATE CONTACT ENTRY
 */ 
 export async function POST(req: NextRequest) {
   try {
     await dbConnect();
     const body = await req.json();
     const contact = await Contact.create({
       ...body,
       status: "pending",
     });
 
     await sendEmailWithRetry(
       "info@oduyemi.dev",
       `New Contact Form Submission: ${body.subject}`,
       `
         <h2>New Contact Form Submission</h2>
 
         <p><strong>Name:</strong> ${body.fullname}</p>
         <p><strong>Email:</strong> ${body.email}</p>
         <p><strong>Topic:</strong> ${body.topic}</p>
         <p><strong>Subject:</strong> ${body.subject}</p>
 
         <hr />
 
         <p><strong>Message:</strong></p>
         <p>${body.message}</p>
       `
     );
 
     return NextResponse.json(
       {
         success: true,
         message: "Contact form submitted successfully",
         data: contact,
       },
       { status: 201 }
     );
   } catch (error) {
     console.error(error);
 
     return NextResponse.json(
       {
         success: false,
         message: "Failed to submit contact form",
       },
       { status: 500 }
     );
   }
 }