export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/**
 * Оруулсан зургийг багасгаж data URL болгоно — офлайн хадгалах болон үр дүнг
 * дахин үзүүлэхэд ашиглана. maxEdge талыг хэтрүүлэхгүйгээр пропорцоор багасгана.
 */
export const fileToDataUrl = (file: File, maxEdge = 640): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) return reject(new Error('no_canvas'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('bad_image'))
    }
    img.src = url
  })
