import { supabase } from "@/shared/lib/supabase";

const DEFAULT_BUCKET = "post-media";

export type UploadOptions = {
  bucket?: string;
  subpath?: string;
  mimeType?: string;
};

export async function uploadToBucket(
  uri: string,
  userId: string,
  { bucket = DEFAULT_BUCKET, subpath, mimeType }: UploadOptions = {},
): Promise<string> {
  const ext = uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
  const base = subpath ? `${userId}/${subpath}` : `${userId}`;
  const filePath = `${base}/${Date.now()}.${ext}`;
  const contentType = mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`;

  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(filePath);
  if (signedError) throw signedError;

  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();

  const uploadResponse = await fetch(signedData.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType, "x-upsert": "false" },
    body: blob,
  });
  if (!uploadResponse.ok) {
    const txt = await uploadResponse.text();
    throw new Error(`Upload failed: ${txt}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
