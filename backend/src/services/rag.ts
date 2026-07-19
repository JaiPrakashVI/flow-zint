import { prisma } from "../lib/prisma"
import { generateEmbedding } from "./openai"

// In-memory cache for vector store chunks when Chroma is unavailable
interface VectorChunk {
  id: string
  businessId: string
  knowledgeDocumentId: string
  vectorRefId: string
  chunkText: string
  chunkIndex: number
  embedding: number[]
}

// Global in-process vector store database
const vectorDatabase: VectorChunk[] = []

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0
  let normA = 0.0
  let normB = 0.0
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Helper to split text content into paragraphs/sentences under ~350 words
export function chunkTextContent(text: string, maxWords = 300): string[] {
  const paragraphs = text.split(/\n\s*\n/)
  const chunks: string[] = []
  let currentChunk = ""

  for (const para of paragraphs) {
    const wordCount = (currentChunk + " " + para).trim().split(/\s+/).length
    if (wordCount <= maxWords) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para
    } else {
      if (currentChunk) chunks.push(currentChunk)
      currentChunk = para
    }
  }
  if (currentChunk) chunks.push(currentChunk)
  return chunks
}

export async function indexKnowledgeDocument(
  businessId: string,
  knowledgeDocumentId: string,
  content: string
): Promise<void> {
  const chunks = chunkTextContent(content)

  console.log(`[RAG Service] Indexing document ${knowledgeDocumentId}. Chunks generated: ${chunks.length}`)

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i]
    const vectorRefId = `vec_ref_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`

    // 1. Generate embedding vector
    const embedding = await generateEmbedding(chunkText)

    // 2. Save metadata in Postgres DB
    await prisma.embedding.create({
      data: {
        knowledgeDocumentId,
        vectorRefId,
        chunkText,
        chunkIndex: i
      }
    })

    // 3. Save in local vector store
    vectorDatabase.push({
      id: `vc_${Date.now()}_${i}`,
      businessId,
      knowledgeDocumentId,
      vectorRefId,
      chunkText,
      chunkIndex: i,
      embedding
    })
  }
}

export async function deleteKnowledgeDocumentIndex(knowledgeDocumentId: string): Promise<void> {
  // 1. Remove from database
  const dbEmbeds = await prisma.embedding.findMany({
    where: { knowledgeDocumentId }
  })
  
  const refIds = dbEmbeds.map(e => e.vectorRefId)

  await prisma.embedding.deleteMany({
    where: { knowledgeDocumentId }
  })

  // 2. Remove from vector store
  let deleteCount = 0
  for (let i = vectorDatabase.length - 1; i >= 0; i--) {
    if (refIds.includes(vectorDatabase[i].vectorRefId) || vectorDatabase[i].knowledgeDocumentId === knowledgeDocumentId) {
      vectorDatabase.splice(i, 1)
      deleteCount++
    }
  }

  console.log(`[RAG Service] Cleaned up indexes for document ${knowledgeDocumentId}. Vectors deleted: ${deleteCount}`)
}

export interface MatchedChunk {
  chunkText: string
  score: number
  documentId: string
}

export async function searchKnowledgeBase(
  businessId: string,
  query: string,
  topK = 3
): Promise<MatchedChunk[]> {
  const queryVector = await generateEmbedding(query)
  const matches: MatchedChunk[] = []

  // Ensure vector store is populated if server restarted, by syncing from DB chunks
  if (vectorDatabase.length === 0) {
    const allEmbeddings = await prisma.embedding.findMany({
      include: { document: true }
    })
    for (const e of allEmbeddings) {
      if (e.document.businessId === businessId) {
        const embedding = await generateEmbedding(e.chunkText)
        vectorDatabase.push({
          id: `sync_${e.id}`,
          businessId: e.document.businessId,
          knowledgeDocumentId: e.knowledgeDocumentId,
          vectorRefId: e.vectorRefId,
          chunkText: e.chunkText,
          chunkIndex: e.chunkIndex,
          embedding
        })
      }
    }
  }

  // Filter chunks scoped strictly to the businessId
  const businessChunks = vectorDatabase.filter(chunk => chunk.businessId === businessId)

  for (const chunk of businessChunks) {
    let score = cosineSimilarity(queryVector, chunk.embedding)

    const STOPWORDS = new Set(["what", "are", "your", "the", "is", "a", "to", "for", "in", "on", "at", "of", "and", "it", "i", "you", "we", "they", "he", "she", "it", "my", "our", "their", "his", "her"])
    const queryTokens = query.toLowerCase().split(/\W+/).filter(t => t && !STOPWORDS.has(t))
    const chunkTextLower = chunk.chunkText.toLowerCase()
    
    if (queryTokens.length > 0) {
      let tokenMatches = 0
      for (const token of queryTokens) {
        if (token && chunkTextLower.includes(token)) {
          tokenMatches++
        }
      }
      
      const overlapRatio = tokenMatches / queryTokens.length
      if (overlapRatio > 0) {
        const apiKey = process.env.OPENAI_API_KEY
        const isMock = !apiKey || apiKey.startsWith("mock") || apiKey === ""
        if (isMock) {
          score = Math.max(score, overlapRatio)
        } else {
          score = Math.min(1.0, score + overlapRatio * 0.4)
        }
      }
    }

    matches.push({
      chunkText: chunk.chunkText,
      score,
      documentId: chunk.knowledgeDocumentId
    })
  }

  // Sort by score descending
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
