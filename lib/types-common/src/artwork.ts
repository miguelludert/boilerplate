import * as yup from "yup";

export interface Artwork {
  title: string;
  alias: string;
  year: number;
  media?: string;
  userId: string;
  artworkId: string;
}

export const artworkSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .max(255, "Title must be at most 255 characters"),
  alias: yup
    .string()
    .required("Alias is required")
    .max(255, "Alias must be at most 255 characters"),
  year: yup
    .number()
    .required("Year is required")
    .min(1000, "Year must be a valid year (min 1000)")
    .max(new Date().getFullYear(), `Year can't exceed the current year`),
  media: yup.string().nullable(), // Optional field
  userId: yup
    .string()
    .required("User ID is required")
    .uuid("User ID must be a valid UUID"),
  artworkId: yup
    .string()
    .required("Artwork ID is required")
    .uuid("Artwork ID must be a valid UUID"),
});
