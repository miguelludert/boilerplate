import axios from "axios";

/**
 * Fetches an image from the given URL and converts it into a Data URL.
 * @param imageUrl - The URL of the image to fetch.
 * @returns A promise that resolves to the Data URL string.
 */
export const fetchImageAsDataUrl = async (
  imageUrl: string,
): Promise<string> => {
  try {
    // Fetch the image as binary data
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer", // Fetch the image as raw binary data
    });

    const buffer = Buffer.from(response.data);

    // Convert the buffer to a Data URL
    const mimeType =
      response.headers["content-type"] || "application/octet-stream";
    const base64Data = buffer.toString("base64");
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error: any) {
    if (error.response.status == 404) {
      console.error("Error fetching image: No image found");
      return "";
    }
    if (error.response.status == 401) {
      console.error("Error fetching image: Unauthorized");
      return "";
    }
    console.info(error);
    throw new Error("Failed to fetch the image");
  }
};
