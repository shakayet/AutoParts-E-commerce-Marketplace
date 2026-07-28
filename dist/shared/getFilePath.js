"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleFilesPath = exports.getSingleFilePath = void 0;
const getSingleFilePath = (files, folderName) => {
    const fileField = files && files[folderName];
    if (fileField && Array.isArray(fileField) && fileField.length > 0) {
        const first = fileField[0];
        if (first.url) {
            return first.url;
        }
        return `/${folderName}/${first.filename}`;
    }
    return undefined;
};
exports.getSingleFilePath = getSingleFilePath;
//multiple files
const getMultipleFilesPath = (files, folderName) => {
    const folderFiles = files && files[folderName];
    if (folderFiles) {
        if (Array.isArray(folderFiles)) {
            return folderFiles.map((file) => {
                if (file.url)
                    return file.url;
                return `/${folderName}/${file.filename}`;
            });
        }
    }
    return undefined;
};
exports.getMultipleFilesPath = getMultipleFilesPath;
//# sourceMappingURL=getFilePath.js.map