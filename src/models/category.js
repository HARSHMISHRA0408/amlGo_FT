import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  amountLimit: { type: Number, required: true },
  userEmail: { type: String, required: true },
});

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

export default Category;
