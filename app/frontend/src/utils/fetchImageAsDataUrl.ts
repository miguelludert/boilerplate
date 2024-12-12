import axios from 'axios';

/**
 * Fetches an image from the given URL and converts it into a Data URL.
 * @param imageUrl - The URL of the image to fetch.
 * @returns A promise that resolves to the Data URL string.
 */
export const fetchImageAsDataUrl = async (
  imageUrl: string
): Promise<string> => {
  try {
    // Fetch the image as a binary blob
    const response = await axios.get(imageUrl, {
      responseType: 'blob', // Fetch the image as a Blob
    });

    const blob = response.data;

    // Convert the blob to a Data URL using FileReader
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        } else {
          reject(new Error('Failed to convert blob to Data URL'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch the image');
  }
};
