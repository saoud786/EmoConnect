const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  // 🔥 Always use auto
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary error:", data);
    throw new Error("Upload failed");
  }

  return {
  url: data.secure_url.replace(
    "/upload/",
    "/upload/fl_attachment/"
  ),
  resourceType: data.resource_type,
  originalName: file.name,
};

};

export default uploadToCloudinary;