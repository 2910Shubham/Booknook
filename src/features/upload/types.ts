export interface UploadedFile {
    file: File;
    arrayBuffer: ArrayBuffer;
    name: string;
    size: number;
}

export interface UploadError {
    message: string;
    code: 'INVALID_TYPE' | 'TOO_LARGE' | 'READ_ERROR';
}
