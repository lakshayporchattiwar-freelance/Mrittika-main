import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: 'No productId provided' }, { status: 400 })
    }

    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Only image and video files are allowed' }, { status: 400 })
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max ${isVideo ? '50MB' : '10MB'}` }, { status: 400 })
    }

    const ext = isVideo ? 'webm' : 'webp'
    const mimeType = isVideo ? 'video/webm' : 'image/webp'
    const timestamp = Date.now()
    const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 40)
    const storagePath = `products/${productId}/${timestamp}_${sanitized}.${ext}`

    let fileBody: Blob

    if (isImage) {
      const converted = await convertImageToWebP(file)
      fileBody = new Blob([new Uint8Array(converted)], { type: mimeType })
    } else {
      const bytes = new Uint8Array(await file.arrayBuffer())
      fileBody = new Blob([bytes], { type: mimeType })
    }

    const supabase = requireAdmin()

    const { data: bucketData } = await supabase.storage.listBuckets()
    const bucketExists = bucketData?.some((b: any) => b.name === 'product-images')

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 52428800,
        allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg', 'image/jpg', 'video/webm', 'video/mp4'],
      })
      if (createError) {
        console.error('[UPLOAD] Bucket creation error:', createError)
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBody, {
        contentType: mimeType,
        upsert: true,
      })

    if (uploadError) {
      console.error('[UPLOAD] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const relativePath = `/product-images/${storagePath}`

    console.log('[UPLOAD] File uploaded successfully:', relativePath)

    return NextResponse.json({
      success: true,
      url: relativePath,
      path: storagePath,
      type: isVideo ? 'video' : 'image',
    })
  } catch (err: any) {
    console.error('[UPLOAD] Error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}

async function convertImageToWebP(file: File): Promise<Uint8Array> {
  try {
    const sharp = await import('sharp')
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const webpBuffer = await sharp.default(inputBuffer)
      .webp({ quality: 80 })
      .toBuffer()
    return new Uint8Array(webpBuffer)
  } catch (err: any) {
    console.warn('[UPLOAD] Sharp not available, storing original as-is:', err.message)
    return new Uint8Array(await file.arrayBuffer())
  }
}
