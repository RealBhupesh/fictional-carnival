import { errorResponse, successResponse } from "@/lib/utils/api";
import { contactFormSchema } from "@/lib/utils/validators";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = contactFormSchema.parse(body);

    // In a real implementation, this is where an email service or ticketing integration would be triggered.
    console.info("Contact form received", payload);

    return successResponse({ received: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.errors.map((e) => e.message).join(", "), 422);
    }
    console.error("POST /api/client/contact", error);
    return errorResponse("Failed to submit contact form", 500);
  }
}
