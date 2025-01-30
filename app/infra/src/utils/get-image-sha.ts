import { ECRClient, DescribeImagesCommand } from "@aws-sdk/client-ecr";

// Global object to store the latest SHAs for multiple repositories
const repositoryShas: Record<string, string | null> = {};

/**
 * Load the SHAs of the latest images for multiple repositories into memory.
 * If a repository does not exist or has no images, it will gracefully skip.
 *
 * @param repositoryNames - Array of repository names
 * @param region - AWS region
 */
export async function loadLatestImageShas(
  repositoryNames: string[],
  region: string
): Promise<void> {
  const client = new ECRClient({ region });

  for (const repositoryName of repositoryNames) {
    try {
      const response = await client.send(
        new DescribeImagesCommand({
          repositoryName,
          filter: {
            tagStatus: "TAGGED", // Only consider tagged images
          },
        })
      );

      // Sort images by pushedAt timestamp (descending)
      const sortedImages = response.imageDetails?.sort((a, b) => {
        const dateA = a.imagePushedAt?.getTime() || 0;
        const dateB = b.imagePushedAt?.getTime() || 0;
        return dateB - dateA;
      });

      // Store the latest SHA in the global object
      if (sortedImages && sortedImages[0]?.imageDigest) {
        repositoryShas[repositoryName] = sortedImages[0].imageDigest;
      } else {
        console.log(`No images found in repository: ${repositoryName}`);
        repositoryShas[repositoryName] = null; // No images available
      }
    } catch (error: any) {
      if (error.name === "RepositoryNotFoundException") {
        console.log(`Repository not found: ${repositoryName}`);
        repositoryShas[repositoryName] = null; // Gracefully handle non-existent repository
      } else {
        console.error(
          `Error fetching images from repository ${repositoryName}:`,
          error
        );
        throw error; // Re-throw unexpected errors
      }
    }
  }

  // Log all loaded SHAs
  console.log("Loaded SHAs for repositories:");
  for (const [repo, sha] of Object.entries(repositoryShas)) {
    console.log(
      `Repository: ${repo}, SHA: ${sha ?? "No image found or repository not found"}`
    );
  }
}

/**
 * Get the latest SHA for a specific repository from memory.
 *
 * @param repositoryName - Name of the repository
 * @returns The latest SHA or null if not available
 */
export function getLatestImageSha(repositoryName: string): string | undefined {
  return repositoryShas[repositoryName] ?? undefined;
}
