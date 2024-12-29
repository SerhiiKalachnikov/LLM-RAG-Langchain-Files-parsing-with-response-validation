export enum EMimeType {
  PDF = 'application/pdf',
  PLAIN_TEXT = 'text/plain',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  IMAGE_JPEG = 'image/jpeg',
}

export const allowedMimeTypes = [
  EMimeType.PDF,
  EMimeType.PLAIN_TEXT,
  EMimeType.DOCX,
  EMimeType.IMAGE_JPEG,
];
