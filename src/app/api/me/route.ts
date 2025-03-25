import { NextResponse } from "next/server";
import { PersonalDetails } from "@/lib/models";
import connectDB from "@/lib/db";
import { personalDetailsSchema } from "@/lib/types";
import { z } from "zod";

export async function GET() {
  try {
    await connectDB();
    const details = await PersonalDetails.findOne();
    // console.log(details);
    if (!details) {
      return NextResponse.json(
        { message: "No personal details found" },
        { status: 404 }
      );
    }

    return NextResponse.json(details);
  } catch (err: unknown) {
    console.error(
      "Personal Details GET Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    try {
      const validatedData = personalDetailsSchema.parse(body);

      // Update existing record or create new one if doesn't exist
      const details = await PersonalDetails.findOneAndUpdate(
        {}, // empty filter to match any document
        validatedData,
        {
          new: true, // return the updated document
          upsert: true, // create if doesn't exist
          runValidators: true, // run mongoose validations
        }
      );

      return NextResponse.json(details, { status: 200 });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Validation Error", errors: err.errors },
          { status: 400 }
        );
      }
      throw err; // Re-throw non-validation errors
    }
  } catch (err: unknown) {
    console.error(
      "Personal Details POST Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
