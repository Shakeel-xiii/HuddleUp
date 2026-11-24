import { Buffer } from "buffer";
import {
  getBytes,
  getDownloadURL,
  getMetadata,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { firebaseApp } from "../firebase/firebaseConfig";

const storage = getStorage(firebaseApp);

export async function uploadFile(file, name, path) {
  if (!file?.base64) {
    throw new Error("Image data is missing.");
  }

  const image = Buffer.from(file.base64, "base64");
  const imageRef = ref(storage, `huddle-up/${path}/${name}`);
  await uploadBytes(imageRef, image, {
    contentType: file.mimeType || "application/octet-stream",
  });
  return getDownloadURL(imageRef);
}

export async function uploadPrivateFile(file, name, path) {
  if (!file?.base64) {
    throw new Error("Image data is missing.");
  }

  const image = Buffer.from(file.base64, "base64");
  const imageRef = ref(storage, `huddle-up/${path}/${name}`);
  await uploadBytes(imageRef, image, {
    contentType: file.mimeType || "application/octet-stream",
  });
  return imageRef.fullPath;
}

export async function getPrivateImageDataUrl(path) {
  const imageRef = ref(storage, path);
  const [image, metadata] = await Promise.all([
    getBytes(imageRef, 10 * 1024 * 1024),
    getMetadata(imageRef),
  ]);
  return `data:${metadata.contentType};base64,${Buffer.from(image).toString("base64")}`;
}

export async function uploadFileFromUrl(url, name, path) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download image (HTTP ${response.status}).`);
  }

  const imageRef = ref(storage, `huddle-up/${path}/${name}`);
  await uploadBytes(imageRef, await response.arrayBuffer(), {
    contentType: response.headers.get("content-type") || "image/jpeg",
  });
  return getDownloadURL(imageRef);
}
