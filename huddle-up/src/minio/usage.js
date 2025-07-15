// Create a function to configure minio
// import * as Minio from "minio";
import * as FileSystem from "expo-file-system";
import AWS from "aws-sdk";
import { Buffer } from "buffer";
AWS.config.update({
  accessKeyId: "ATN02gWsBSWqkPzOa4Pw",
  secretAccessKey: "fb6W8KCH0vjG36MfkfzBXYO1ribTRawqMEy07ZIE",
  region: "us-east-1",
  endpoint: "https://assets.almasood.org/",
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});
const s3 = new AWS.S3();
export async function uploadFile(file, name, path) {
  const bucketName = `huddle-up/${path}`;
  const objectName = name;
  const metaData = {
    "Content-Type": "image/png",
  };
  try {
    const result = await s3
      .putObject({
        Bucket: bucketName,
        Key: objectName,
        Body: Buffer.from(file.base64, "base64"),
        ContentType: file.mimeType,
      })
      .promise();
    console.log("File uploaded successfully:", result);
    return `https://assets.almasood.org/${bucketName}/${objectName}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}
// Generate a function that uploads a file to minio from another url
export async function uploadFileFromUrl(url, name, path) {
  const bucketName = `huddle-up/${path}`;
  const objectName = name;
  const metaData = {
    "Content-Type": "image/png",
  };
  try {
    const result = await s3
      .putObject({
        Bucket: bucketName,
        Key: objectName,
        Body: Buffer.from(await (await fetch(url)).arrayBuffer()),
        ContentType: "image/jpg",
      })
      .promise();
    console.log("File uploaded successfully:", result);
    return `https://assets.almasood.org/${bucketName}/${objectName}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}
