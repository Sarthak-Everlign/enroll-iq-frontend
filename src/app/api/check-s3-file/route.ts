import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path') as string
    const fileName = searchParams.get('fileName') as string | null
    const applicationId = searchParams.get('applicationId') as string | null

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

    // Construct S3 prefix path
    let s3Prefix: string
    if (path.endsWith('/')) {
      s3Prefix = path
    } else {
      // If path doesn't end with /, treat it as a folder and add /
      s3Prefix = `${path}/`
    }

    // Replace placeholders in path if applicationId is provided
    if (applicationId) {
      s3Prefix = s3Prefix.replace('{applicationId}', applicationId)
    }

    // If fileName is provided, check for specific file (remove trailing / and append filename)
    if (fileName) {
      s3Prefix = s3Prefix.endsWith('/') 
        ? `${s3Prefix}${fileName}` 
        : `${s3Prefix}/${fileName}`
    }

    // List objects with this prefix (limit to 1 to check existence)
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: s3Prefix,
      MaxKeys: 1,
    })

    const response = await s3Client.send(command)

    // Check if any objects exist
    const exists = (response.Contents && response.Contents.length > 0) || false

    if (exists && response.Contents && response.Contents[0]) {
      const firstObject = response.Contents[0]
      const s3Key = firstObject.Key || s3Prefix
      const region = process.env.AWS_REGION || 'us-east-1'
      const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`

      return NextResponse.json({
        success: true,
        exists: true,
        data: {
          s3Key,
          s3Url,
        },
      })
    }

    return NextResponse.json({
      success: true,
      exists: false,
    })
  } catch (error) {
    console.error('S3 check error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check file existence',
      },
      { status: 500 }
    )
  }
}

