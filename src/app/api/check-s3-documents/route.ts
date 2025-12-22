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
    const applicationId = searchParams.get('applicationId') as string

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
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

    // Define all document paths to check
    const documentPaths = [
      {
        key: 'form16',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/form16/`,
      },
      {
        key: 'caste',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/caste_certificate/`,
      },
      {
        key: 'marksheet10th',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/marksheet_10th/`,
      },
      {
        key: 'marksheet12th',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/marksheet_12th/`,
      },
      {
        key: 'graduation',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/graduation/`,
      },
      {
        key: 'offerLetter',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/offer_letter/`,
      },
      {
        key: 'bankPassbook',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/bank_passbook/`,
      },
      {
        key: 'statementOfPurpose',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/statement_of_purpose/`,
      },
      {
        key: 'cv',
        path: `enroll_iq_files/submission_files/${applicationId}/documents/cv/`,
      },
    ]

    // Check all documents in parallel
    const checkPromises = documentPaths.map(async (doc) => {
      try {
        const command = new ListObjectsV2Command({
          Bucket: process.env.S3_BUCKET_NAME,
          Prefix: doc.path,
          MaxKeys: 1,
        })

        const response = await s3Client.send(command)
        const exists = (response.Contents && response.Contents.length > 0) || false

        if (exists && response.Contents && response.Contents[0]) {
          const s3Key = response.Contents[0].Key || doc.path
          const region = process.env.AWS_REGION || 'us-east-1'
          const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`

          return {
            key: doc.key,
            exists: true,
            s3Key,
            s3Url,
          }
        }

        return {
          key: doc.key,
          exists: false,
        }
      } catch (error) {
        console.error(`Error checking ${doc.key}:`, error)
        return {
          key: doc.key,
          exists: false,
        }
      }
    })

    const results = await Promise.all(checkPromises)

    // Convert to object for easier access
    const documentStatus: Record<string, {
      exists: boolean
      s3Key?: string
      s3Url?: string
    }> = {}

    results.forEach((result) => {
      documentStatus[result.key] = {
        exists: result.exists,
        ...(result.exists && {
          s3Key: result.s3Key,
          s3Url: result.s3Url,
        }),
      }
    })

    return NextResponse.json({
      success: true,
      data: documentStatus,
    })
  } catch (error) {
    console.error('S3 documents check error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check documents',
      },
      { status: 500 }
    )
  }
}

