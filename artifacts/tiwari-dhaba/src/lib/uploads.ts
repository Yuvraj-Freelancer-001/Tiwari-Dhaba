type UploadUrlResponse = {
  uploadURL: string;
  objectPath: string;
};

type UploadCompleteResponse = {
  imagePath: string;
};

export async function uploadDhabaImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP photo.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Photos must be 8 MB or smaller.");
  }
  const response = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type,
    }),
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(error?.error || "Could not prepare this photo upload.");
  }
  const upload = (await response.json()) as UploadUrlResponse;
  const result = await fetch(upload.uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!result.ok) throw new Error("Photo upload failed. Please try again.");
  const complete = await fetch("/api/storage/uploads/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ objectPath: upload.objectPath }),
  });
  if (!complete.ok) {
    const error = (await complete.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(error?.error || "The uploaded photo could not be validated.");
  }
  return ((await complete.json()) as UploadCompleteResponse).imagePath;
}