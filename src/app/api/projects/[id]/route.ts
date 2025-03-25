// import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Project } from "@/lib/models";
import connectDB from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }
    const ProjectId = await params.id;
    await connectDB();
    const body = await request.json();
    const project = await Project.findByIdAndUpdate(ProjectId, body, {
      new: true,
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (err: unknown) {
    console.error(
      "Project PUT Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const ProjectId = await params.id;
    await connectDB();
    const project = await Project.findByIdAndDelete(ProjectId);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err: unknown) {
    console.error(
      "Project DELETE Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
