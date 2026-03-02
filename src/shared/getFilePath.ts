/* eslint-disable @typescript-eslint/no-explicit-any */
type IFolderName = 'image' | 'media' | 'doc';

//single file
type MulterFile = { filename: string };

export const getSingleFilePath = (
  files: Record<string, MulterFile[] | undefined> | undefined,
  folderName: IFolderName,
) => {
  const fileField = files && files[folderName];
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    const first = fileField[0] as any;
    if (first.url) {
      return first.url as string;
    }
    return `/${folderName}/${first.filename}`;
  }

  return undefined;
};

//multiple files
export const getMultipleFilesPath = (
  files: Record<string, MulterFile[] | undefined> | undefined,
  folderName: IFolderName,
) => {
  const folderFiles = files && files[folderName];
  if (folderFiles) {
    if (Array.isArray(folderFiles)) {
      return folderFiles.map((file: any) => {
        if (file.url) return file.url as string;
        return `/${folderName}/${file.filename}`;
      });
    }
  }

  return undefined;
};
