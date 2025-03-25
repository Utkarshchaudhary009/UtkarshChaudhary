import { NextResponse } from "next/server";
import { Contact } from "@/lib/models";
import connectDB from "@/lib/db";
import { z } from "zod";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);

// Reply schema
const ReplySchema = z.object({
  message: z.string().min(10, "Reply must be at least 10 characters"),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Validate the reply message
    const { message } = ReplySchema.parse(body);

    await connectDB();

    // Find the contact message
    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json(
        { message: "Contact message not found" },
        { status: 404 }
      );
    }

    // Update the contact status to replied
    contact.status = "replied";
    await contact.save();

    // Send the reply email
    await resend.emails.send({
      from: "work.utkarshchaudhary426@gmail.com",
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `
        <h2>Reply to your message</h2>
        <p>Dear ${contact.name},</p>
        <p>${message}</p>
        <p>Best regards,<br>Utkarsh Chaudhary</p>
      `,
    });

    revalidatePath("/admin/inbox");

    return NextResponse.json({
      message: "Reply sent successfully",
      contact,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: err.errors },
        { status: 400 }
      );
    }

    console.error("Reply Error:", err);
    return NextResponse.json(
      { message: "Failed to send reply" },
      { status: 500 }
    );
  }
}
