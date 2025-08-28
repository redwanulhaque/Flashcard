import { PrismaClient } from "@/app/generated/prisma";




// Initialize Prisma Client to interact with the database
const prisma = new PrismaClient();




/*-------------------- GET --------------------*/
export async function GET() {

  try {
    // Retrieve all study tools and include their associated flashcards
    const studyTools = await prisma.studyTool.findMany({
      include: { flashcards: true }, // Include related flashcards
    });

    // Return success response with fetched data
    return Response.json({ message: "Prisma is working", data: studyTools });
  } 

  catch (error) {
    // Log any error and return 500 response
    console.error(error);
    return Response.json({ error: "Failed to fetch study tools" }, { status: 500 });
  }

}




/*-------------------- POST --------------------*/
export async function POST(req) {

  try {
    // Parse the JSON body of the request
    const body = await req.json();

    // If 'name' is provided, create a new study tool
    if (body.name) {
      const tool = await prisma.studyTool.create({
        data: { name: body.name }, // Insert study tool with given name
    });

      return Response.json({ message: "Study tool created", data: tool }, { status: 201 });
    }

    // Destructure flashcard data from request body
    const { toolId, question, answer } = body;

    // Validate required fields for flashcard creation
    if (!toolId || !question || !answer) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create a new flashcard and associate it with the correct study tool
    const flashcard = await prisma.flashcard.create({
      data: { question, answer, tool: { connect: { id: toolId } } },
    });

    // Return success response with created flashcard
    return Response.json({ message: "Flashcard created", data: flashcard }, { status: 201 });
  }

  catch (error) {
    // Log any error and return 500 response
    console.error(error);
    return Response.json({ error: "Failed to create item" }, { status: 500 });
  }

}




/*-------------------- DELETE --------------------*/
export async function DELETE(req) {

  try {
    const url = new URL(req.url);
    const flashcardId = url.searchParams.get("flashcardId");
    const toolId = url.searchParams.get("toolId");

    if (flashcardId) {
      // delete flashcard
      await prisma.flashcard.delete({ where: { id: Number(flashcardId) } });
      return Response.json({ message: "Flashcard deleted" });
    }

    if (toolId) {
      // delete all flashcards for this tool
      await prisma.flashcard.deleteMany({ where: { toolId: Number(toolId) } });
      // delete the study tool
      await prisma.studyTool.delete({ where: { id: Number(toolId) } });
      return Response.json({ message: "Study tool deleted" });
    }

    // reset database
    await prisma.flashcard.deleteMany();

    await prisma.studyTool.deleteMany();

    return Response.json({ message: "Database reset successfully" });

  } 
  
  catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to reset" }, { status: 500 });
  }

}




/*-------------------- PUT --------------------*/
export async function PUT(req) {

}






