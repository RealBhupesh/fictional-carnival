import { NextResponse } from "next/server";

export const successResponse = (data: unknown, init?: ResponseInit) =>
  NextResponse.json({ success: true, data }, init);

export const errorResponse = (message: string, status: number = 400) =>
  NextResponse.json({ success: false, error: message }, { status });
