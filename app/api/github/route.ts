import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://github-contributions-api.jogruber.de/v4/Suv00m?y=last",
    { next: { revalidate: 21600 } }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
