const uploadFile = async (file: File): Promise<string | null> => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("profilePicture", file);

  try {
    const response = await fetch("http://localhost:1234/new", {
      method: "POST",
      body: formData,
    });

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
    console.error("Error uploading profile picture:", error);
    return null;
  }
};

export default uploadFile;
