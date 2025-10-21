type IFolderName = 'image' | 'media' | 'doc';

//single file
type MulterFile = { filename: string };

export const getSingleFilePath = (files: Record<string, MulterFile[] | undefined> | undefined, folderName: IFolderName) => {
  const fileField = files && files[folderName];
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    return `/${folderName}/${fileField[0].filename}`;
  }

  return undefined;
};

//multiple files
export const getMultipleFilesPath = (files: Record<string, MulterFile[] | undefined> | undefined, folderName: IFolderName) => {
  const folderFiles = files && files[folderName];
  if (folderFiles) {
    if (Array.isArray(folderFiles)) {
      return folderFiles.map((file: MulterFile) => `/${folderName}/${file.filename}`);
    }
  }

  return undefined;
};
