import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { toast } from "sonner-native";

export type PickedImage = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

export type PickImageOptions = {
  allowsEditing?: boolean;
  quality?: number;
};

export function useImagePicker() {
  return useCallback(
    async ({
      allowsEditing = false,
      quality = 0.8,
    }: PickImageOptions = {}): Promise<PickedImage | null> => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toast.error("Please allow access to your photo library.");
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing,
        quality,
      });
      if (result.canceled || result.assets.length === 0) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      };
    },
    [],
  );
}
