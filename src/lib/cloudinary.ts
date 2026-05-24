const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dgwspegi5/auto/upload';
const UPLOAD_PRESET = 'school_registration';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export async function uploadToCloudinary(
  file: File, 
  folder: 'transcripts' | 'receipts',
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_URL, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response: CloudinaryResponse = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        const error = JSON.parse(xhr.responseText);
        reject(new Error(error.error?.message || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', `school-registration/${folder}`);

    xhr.send(formData);
  });
}

export function validateFile(file: File) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file format. Allowed: JPG, PNG, WEBP, PDF');
  }

  return true;
}
