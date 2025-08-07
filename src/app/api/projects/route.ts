import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { generateId } from '@/lib/utils'

// Configuration pour Vercel/Next.js build - Force mode dynamique
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = false
export const dynamicParams = true
export const runtime = 'nodejs'

const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  venue: z.string().optional(),
  attendees: z.number().positive().optional(),
  eventType: z.string().optional(),
  userId: z.string(),
  requirements: z.any().optional(),
  constraints: z.any().optional()
})

const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']).optional()
})

export async function GET(request: NextRequest) {
  try {
    // Éviter les appels Prisma pendant le build
    if (process.env.NODE_ENV !== 'production' && !request.url) {
      return NextResponse.json({ error: 'Build time - no database access' })
    }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const projectId = searchParams.get('projectId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    if (projectId) {
      // Get specific project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          conversations: {
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 5
              }
            }
          },
          documents: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      
      if (!project || project.userId !== userId) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: project
      })
    } else {
      // Get all projects for user
      const projects = await prisma.project.findMany({
        where: { userId },
        include: {
          conversations: {
            take: 1,
            orderBy: { updatedAt: 'desc' }
          },
          documents: {
            take: 3,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
      
      return NextResponse.json({
        success: true,
        data: projects
      })
    }
    
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)
    
    const project = await prisma.project.create({
      data: {
        id: generateId(),
        ...validatedData,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        requirements: validatedData.requirements ? JSON.parse(JSON.stringify(validatedData.requirements)) : null,
        constraints: validatedData.constraints ? JSON.parse(JSON.stringify(validatedData.constraints)) : null
      },
      include: {
        conversations: true,
        documents: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: project
    })
    
  } catch (error) {
    console.error('Create project error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)
    
    const { id, ...updateData } = validatedData
    
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        deadline: updateData.deadline ? new Date(updateData.deadline) : undefined,
        requirements: updateData.requirements ? JSON.parse(JSON.stringify(updateData.requirements)) : undefined,
        constraints: updateData.constraints ? JSON.parse(JSON.stringify(updateData.constraints)) : undefined
      },
      include: {
        conversations: true,
        documents: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: project
    })
    
  } catch (error) {
    console.error('Update project error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const userId = searchParams.get('userId')
    
    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      )
    }
    
    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })
    
    if (!project || project.userId !== userId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    await prisma.project.delete({
      where: { id: projectId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}