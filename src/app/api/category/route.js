import { connectDB } from "@/lib/mongo";
import Category from "@/models/category";
import { cookies } from "next/headers";

export async function GET() {
  await connectDB();

  // Get logged-in user from cookie
  const cookieStore =await cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))
    : null;
  if (!user) return new Response(JSON.stringify([]), { status: 200 });

  // Fetch categories only for this user
  const category = await Category.find({ userEmail: user.email }).sort({
    date: -1,
  });
  return new Response(JSON.stringify(category), { status: 200 });
}

export async function POST(req) {
  await connectDB();
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))
    : null;
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  const { amountLimit, category } = await req.json();
  const newCategory = await Category.create({
    category,
    amountLimit,
    userEmail: user.email, // Add user email here
  });

  return new Response(JSON.stringify(newCategory), { status: 201 });
}

export async function PUT(req) {
  await connectDB();
  
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))
    : null;
    
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  const { id, amountLimit, categoryName } = await req.json();  // Renamed 'category' to 'categoryName' to avoid conflict
  
  if (!id || !amountLimit || !categoryName) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400 }
    );
  }

  // Ensure only the owner can update
  const updatedCategory = await Category.findOneAndUpdate(
    { _id: id, userEmail: user.email },  // Ensuring the category belongs to the logged-in user
    { amountLimit, categoryName },  // Update fields with new values
    { new: true }
  );

  if (!updatedCategory)
    return new Response(
      JSON.stringify({ error: "Category not found or unauthorized" }),
      { status: 404 }
    );

  return new Response(JSON.stringify(updatedCategory), { status: 200 });
}


export async function DELETE(req) {
  await connectDB();
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))
    : null;
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  const { id } = await req.json();

  // Ensure only the owner can delete
  const deleted = await Category.findOneAndDelete({
    _id: id,
    userEmail: user.email,
  });
  if (!deleted)
    return new Response(
      JSON.stringify({ error: "Category not found or unauthorized" }),
      { status: 404 }
    );

  return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
