import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string // S3 path prefix (e.g., "enroll_iq_files/submission_files/{applicationId}/KYC")
    const fileName = formData.get('fileName') as string | null // Optional custom filename
    const applicationId = formData.get('applicationId') as string | null // Optional, for path construction

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    if (!path) {
      return NextResponse.json(
        { success: false, message: 'No path provided' },
        { status: 400 }
      )
    }

    // Validate environment variables
    if (!process.env.S3_BUCKET_NAME) {
      return NextResponse.json(
        { success: false, message: 'S3 bucket name not configured' },
        { status: 500 }
      )
    }

    // Generate unique identifier if no custom filename provided
    const uniqueIdentifier = fileName || uuidv4()
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine file extension from file name or type
    let extension = 'bin'
    if (file.name) {
      const nameParts = file.name.split('.')
      if (nameParts.length > 1) {
        extension = nameParts[nameParts.length - 1].toLowerCase()
      }
    }
    
    // If no extension found, try to infer from content type
    if (extension === 'bin' && file.type) {
      const typeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'text/plain': 'txt',
      }
      extension = typeMap[file.type] || 'bin'
    }

    // Construct S3 key path
    // If path ends with /, append filename. Otherwise, treat path as full path
    let s3Key: string
    if (path.endsWith('/')) {
      s3Key = `${path}${uniqueIdentifier}.${extension}`
    } else {
      // If path doesn't end with /, use it as-is (assumes it includes filename)
      s3Key = path.includes('.') ? path : `${path}/${uniqueIdentifier}.${extension}`
    }

    // Replace placeholders in path if applicationId is provided
    if (applicationId) {
      s3Key = s3Key.replace('{applicationId}', applicationId)
    }

    // Determine content type
    const contentType = file.type || 'application/octet-stream'

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
    })

    await s3Client.send(command)

    // Construct the S3 URL
    const region = process.env.AWS_REGION || 'us-east-1'
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        s3Key,
        s3Url,
        fileName: file.name,
        fileSize: file.size,
        contentType,
        uniqueIdentifier: fileName ? undefined : uniqueIdentifier,
      },
    })
  } catch (error) {
    console.error('S3 upload error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload file',
      },
      { status: 500 }
    )
  }
}


