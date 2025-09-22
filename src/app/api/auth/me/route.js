import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get("user"); // read HTTP-only cookie
    if (!userCookie) return new Response(JSON.stringify({ user: null }), { status: 200 });

    const user = JSON.parse(userCookie.value); // { email, role }
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ user: null }), { status: 500 });
  }
}
