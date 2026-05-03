import axios from 'axios';

const CLOUD_NAME =
  'dymtfs82u';

const UPLOAD_PRESET =
  'wishcraft_upload';

export const uploadImage =
  async (imageSrc) => {

    try {

      // =========================================
      // VALIDATE
      // =========================================

      if (!imageSrc) {

        throw new Error(
          'No image source provided.'
        );
      }

      console.log(
        'Uploading image:',
        imageSrc
      );

      // =========================================
      // CONVERT TO BLOB
      // =========================================

      const imageResponse =
        await fetch(imageSrc);

      const blob =
        await imageResponse.blob();

      console.log(
        'Blob:',
        blob
      );

      // =========================================
      // FORM DATA
      // =========================================

      const formData =
        new FormData();

      formData.append(
        'file',
        blob
      );

      formData.append(
        'upload_preset',
        UPLOAD_PRESET
      );

      // =========================================
      // UPLOAD
      // =========================================

      const response =
        await axios.post(

          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

          formData
        );

      console.log(
        'Cloudinary Success:',
        response.data
      );

      return response.data.secure_url;

    } 

    catch (err) {

  console.log(
    'CLOUDINARY RESPONSE:',
    err.response?.data
  );

  throw err;
  }
};