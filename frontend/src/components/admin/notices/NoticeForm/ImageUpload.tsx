interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // ここに画像アップロード処理を実装
      console.log('File selected:', e.target.files[0]);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-[#2C3E50]">画像アップロード</h3>
      <div className="mt-4">
        <label className="block">
          <span className="sr-only">画像を選択</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#4A90E2] file:text-white hover:file:bg-[#357ABD]"
          />
        </label>
      </div>
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  const newImages = [...images];
                  newImages.splice(index, 1);
                  onChange(newImages);
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
