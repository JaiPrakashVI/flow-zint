import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { indexKnowledgeDocument, deleteKnowledgeDocumentIndex } from "../services/rag"

export async function uploadKnowledgeDocument(req: Request, res: Response) {
  const { title, type, content } = req.body
  
  if (!title || !type || !content) {
    return res.status(400).json({ error: "Missing required fields (title, type, content)" })
  }

  try {
    // Locate default business tenant
    let business = await prisma.business.findFirst()
    if (!business) {
      business = await prisma.business.create({
        data: {
          name: "Veda Wellness & Performance",
          category: "Clinic & Fitness Centre",
          whatsappNumber: "+91 99160 55442"
        }
      })
    }

    const businessId = business.id

    // 1. Create KnowledgeDocument in Postgres
    const document = await prisma.knowledgeDocument.create({
      data: {
        businessId,
        title,
        type: type.toLowerCase() as any,
        content
      }
    })

    // 2. Chunk, embed, and index in vector store
    await indexKnowledgeDocument(businessId, document.id, content)

    console.log(`[Knowledge Controller] Indexed document: ${document.title}`)
    return res.status(201).json(document)

  } catch (error: any) {
    console.error("[Knowledge Controller] Failed to upload document:", error)
    return res.status(500).json({ error: error.message || "Failed to upload document" })
  }
}

export async function listKnowledgeDocuments(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(200).json({ data: [], total: 0 })
    }

    const documents = await prisma.knowledgeDocument.findMany({
      where: { businessId: business.id },
      skip,
      take: limit,
      orderBy: { uploadedAt: "desc" }
    })

    const total = await prisma.knowledgeDocument.count({
      where: { businessId: business.id }
    })

    return res.status(200).json({
      data: documents,
      page,
      limit,
      total
    })

  } catch (error: any) {
    console.error("[Knowledge Controller] Failed to list documents:", error)
    return res.status(500).json({ error: error.message || "Failed to list documents" })
  }
}

export async function deleteKnowledgeDocument(req: Request, res: Response) {
  const { id } = req.params

  try {
    const document = await prisma.knowledgeDocument.findUnique({ where: { id } })
    if (!document) {
      return res.status(404).json({ error: "Knowledge document not found" })
    }

    // 1. Delete matching vector chunks from in-process index and embeddings table
    await deleteKnowledgeDocumentIndex(id)

    // 2. Delete main document from Postgres
    await prisma.knowledgeDocument.delete({ where: { id } })

    console.log(`[Knowledge Controller] Deleted document ID: ${id}`)
    return res.status(200).json({ success: true, message: "Document deleted and unindexed successfully" })

  } catch (error: any) {
    console.error("[Knowledge Controller] Failed to delete document:", error)
    return res.status(500).json({ error: error.message || "Failed to delete document" })
  }
}
