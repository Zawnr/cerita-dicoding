export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}



/**
 * Ref: https://stackoverflow.com/questions/18650168/convert-blob-to-base64
 */
export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Ref: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 */
export function convertBase64ToBlob(base64Data, contentType = '', sliceSize = 512) {
  try {
      // Pisahkan bagian metadata dari data base64
      const base64Pattern = /^data:([A-Za-z-+\/]+);base64,(.+)$/;
      const matches = base64Data.match(base64Pattern);
      
      if (!matches || matches.length !== 3) {
          throw new Error('Invalid base64 data URL format');
      }

      contentType = matches[1] || contentType;
      const base64String = matches[2];
      
      // Bersihkan string base64 dari karakter whitespace
      const cleanBase64 = base64String.replace(/\s/g, '');
      
      const byteCharacters = atob(cleanBase64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);

          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: contentType });
  } catch (error) {
      console.error('Error converting base64 to blob:', error);
      throw new Error('Failed to convert base64 to blob: ' + error.message);
  }
}
