const uploadFile = async (
  file: File,
  rmbg: boolean,
): Promise<string | null> => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("profilePicture", file);

  try {
    const url = new URL("http://localhost:1234/new");
    if (rmbg) {
      url.searchParams.append("rmbg", "true");
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (response.status === 400) {
      throw new Error("Unsupported image format");
    }

    const result = await response.json();
    console.log("Upload result:", result);

    if (
      result.hashes &&
      Array.isArray(result.hashes) &&
      result.hashes.length === 1
    ) {
      const uploadedHash = result.hashes[0];
      console.log("Uploaded file hash:", uploadedHash);
      return uploadedHash;
    } else {
      console.error("Expected exactly one hash in the response");
      return null;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Unsupported image format"
    ) {
      console.error(error.message);
      throw error;
    }
    console.error("Error uploading profile picture:", error);
    return null;
  }
};

export default uploadFile;
