import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import type { OrderChatPhoto } from '../api/supportChatServiceTypes';

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif']);

function photoMimeType(asset: ImagePicker.ImagePickerAsset): string {
  const mimeType = asset.mimeType?.toLowerCase();
  if (mimeType) return mimeType;
  const name = asset.fileName ?? asset.uri;
  if (/\.png(?:\?|$)/i.test(name)) return 'image/png';
  if (/\.hei[cf](?:\?|$)/i.test(name)) return 'image/heic';
  return 'image/jpeg';
}

export function useOrderChatPhotoPicker() {
  const [photo, setPhoto] = useState<OrderChatPhoto | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const pickPhoto = async () => {
    if (isPicking) return;
    setErrorKey(null);
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorKey('chat_photo_permission');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const mimeType = photoMimeType(asset);
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        setErrorKey('chat_photo_type');
        return;
      }
      if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
        setErrorKey('chat_photo_size');
        return;
      }
      setPhoto({
        uri: asset.uri,
        fileName: asset.fileName || `order-photo.${mimeType === 'image/png' ? 'png' : mimeType === 'image/heic' || mimeType === 'image/heif' ? 'heic' : 'jpg'}`,
        mimeType,
      });
    } catch {
      setErrorKey('chat_photo_pick_failed');
    } finally {
      setIsPicking(false);
    }
  };

  return { photo, errorKey, isPicking, pickPhoto, clearPhoto: () => setPhoto(null) };
}
