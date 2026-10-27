import { useDropzone } from 'react-dropzone'
import { Upload, X, Image } from 'lucide-react'

export function ImageDropzone({ onFile, file, onRemove, accept = 'image/*', maxMB = 20 }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: maxMB * 1024 * 1024,
    onDrop: ([accepted]) => accepted && onFile(accepted),
  })

  if (file) {
    const url = URL.createObjectURL(file)
    return (
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
        <img src={url} alt="Preview" className="w-full max-h-64 object-contain" />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-slate-500 hover:text-red-600 transition-colors"
        >
          <X size={14} />
        </button>
        <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-200 truncate">
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-[#F59E0B] bg-amber-50'
          : 'border-slate-200 bg-slate-50 hover:border-[#14283F] hover:bg-slate-100'
      }`}
    >
      <input {...getInputProps()} />
      <Upload size={28} className="mx-auto text-slate-300 mb-3" />
      <p className="text-sm font-medium text-[#172B3A]">
        {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to browse'}
      </p>
      <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP — max {maxMB}MB</p>
    </div>
  )
}
