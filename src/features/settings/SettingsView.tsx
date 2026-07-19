import { useState, useEffect, useCallback } from "react"
import { initialKnowledgeDocuments } from "../dashboard/mockData"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import {
  Plus,
  Trash,
  Sparkles,
  Link,
  Save,
  CheckCircle,
  Eye,
  FileText,
  User,
  RefreshCw,
  Search,
} from "lucide-react"
import type { KnowledgeDocument } from "../dashboard/types"
import { apiClient } from "../../lib/apiClient"

export function SettingsView({ isDemoMode = false }: { isDemoMode?: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "kb" | "whatsapp" | "account">("profile")
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(initialKnowledgeDocuments)
  const [searchQuery, setSearchQuery] = useState("")

  // Business profile state
  const [bizName, setBizName] = useState("Veda Wellness & Performance")
  const [bizCategory, setBizCategory] = useState("Clinic & Fitness Centre")
  const [bizNumber, setBizNumber] = useState("+91 99160 55442")
  const [bizTimezone, setBizTimezone] = useState("Asia/Kolkata")
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Document creation form state
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [docTitle, setDocTitle] = useState("")
  const [docType, setDocType] = useState<KnowledgeDocument["type"]>("SERVICE")
  const [docContent, setDocContent] = useState("")

  // Selected document reader modal
  const [readingDoc, setReadingDoc] = useState<KnowledgeDocument | null>(null)

  // Fetch profile on mount
  useEffect(() => {
    if (isDemoMode) return
    apiClient.get("/api/business/me")
      .then(res => {
        setBizName(res.name || "")
        setBizCategory(res.category || "")
        setBizNumber(res.whatsappNumber || "")
        setBizTimezone(res.timezone || "Asia/Kolkata")
      })
      .catch(err => console.error("Failed to load business profile:", err))
  }, [isDemoMode])

  const fetchDocs = useCallback(() => {
    if (isDemoMode) return
    apiClient.get("/api/business/knowledge")
      .then(res => {
        const docs = res.data.map((d: any) => ({
          id: d.id,
          title: d.title,
          type: d.type.toUpperCase() as any,
          content: d.content,
          uploadedAt: d.uploadedAt.split("T")[0]
        }))
        setDocuments(docs)
      })
      .catch(err => console.error("Failed to fetch documents:", err))
  }, [isDemoMode])

  // Fetch documents on mount
  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemoMode) {
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 2000)
      return
    }
    try {
      await apiClient.patch("/api/business/me", {
        name: bizName,
        category: bizCategory,
        whatsappNumber: bizNumber,
        timezone: bizTimezone
      })
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to save profile:", err)
    }
  }

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docTitle || !docContent) return

    if (isDemoMode) {
      const newDoc: KnowledgeDocument = {
        id: `kd_manual_${Date.now()}`,
        title: docTitle,
        type: docType,
        content: docContent,
        uploadedAt: new Date().toISOString().split("T")[0],
      }
      setDocuments([newDoc, ...documents])
      setDocTitle("")
      setDocContent("")
      setShowAddDoc(false)
      return
    }

    try {
      await apiClient.post("/api/business/knowledge", {
        title: docTitle,
        type: docType,
        content: docContent
      })
      fetchDocs()
      setDocTitle("")
      setDocContent("")
      setShowAddDoc(false)
    } catch (err) {
      console.error("Failed to upload document:", err)
      const newDoc: KnowledgeDocument = {
        id: `kd_manual_${Date.now()}`,
        title: docTitle,
        type: docType,
        content: docContent,
        uploadedAt: new Date().toISOString().split("T")[0],
      }
      setDocuments([newDoc, ...documents])
      setDocTitle("")
      setDocContent("")
      setShowAddDoc(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (isDemoMode) {
      setDocuments(documents.filter((doc) => doc.id !== id))
      return
    }
    try {
      await apiClient.delete(`/api/business/knowledge/${id}`)
      fetchDocs()
    } catch (err) {
      console.error("Failed to delete document:", err)
      setDocuments(documents.filter((doc) => doc.id !== id))
    }
  }

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDocBadgeVariant = (type: string) => {
    switch (type) {
      case "SERVICE":
        return "info"
      case "PRICING":
        return "success"
      case "FAQ":
        return "secondary"
      case "POLICY":
        return "outline"
      case "OFFER":
        return "warning"
      default:
        return "muted"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">FlowPilot Settings Panel</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure business details, upload knowledge documents, and link WhatsApp gateways
        </p>
      </div>

      {/* Settings Sub-Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-1">
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === "profile"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Business Profile
        </button>
        <button
          onClick={() => setActiveSubTab("kb")}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === "kb"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Vector Knowledge Base
        </button>
        <button
          onClick={() => setActiveSubTab("whatsapp")}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === "whatsapp"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          WhatsApp Cloud Gateway
        </button>
        <button
          onClick={() => setActiveSubTab("account")}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === "account"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Administrator Account
        </button>
      </div>

      {/* Document Viewer Modal Overlay */}
      {readingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-[500px] border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="pb-3 border-b border-border/80 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xs font-bold text-foreground truncate max-w-[320px]">
                  {readingDoc.title}
                </CardTitle>
                <CardDescription className="text-[9px] text-muted-foreground mt-0.5 font-mono">
                  Type: {readingDoc.type} · Sync Date: {readingDoc.uploadedAt}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[8px] border-border font-mono">
                {readingDoc.id}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="bg-muted/30 border border-border/60 rounded p-3 text-xs font-medium leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap text-muted-foreground">
                {readingDoc.content}
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setReadingDoc(null)}>
                  Close Viewer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Knowledge Base Uploader Modal Overlay */}
      {showAddDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-[450px] border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold text-foreground">Upload Document Context</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Feed services, policies, and pricing to the AI RAG indexing pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAddDocument} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar Class Timings"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="flex h-8.5 w-full rounded border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as KnowledgeDocument["type"])}
                    className="flex h-8.5 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  >
                    <option value="SERVICE">Service Information</option>
                    <option value="PRICING">Pricing Schedules</option>
                    <option value="FAQ">Frequently Asked Questions</option>
                    <option value="POLICY">Operational Policies</option>
                    <option value="OFFER">Special Promotions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Content Body
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Provide detailed content for the AI to draw answers from..."
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    className="flex w-full rounded border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-border/80 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDoc(false)}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="h-8 gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Upload & Index Document</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Rendering based on Tab */}
      {activeSubTab === "profile" && (
        <Card className="border-border bg-card/40 max-w-lg">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
              Profile Configurations
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Edit public profile fields and timing details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-success font-bold bg-success/15 border border-success/20 rounded p-2.5 justify-center">
                  <CheckCircle className="h-4 w-4" />
                  <span>Changes saved successfully!</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Business Name
                </label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="flex h-9 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Category
                </label>
                <input
                  type="text"
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  className="flex h-9 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={bizNumber}
                  onChange={(e) => setBizNumber(e.target.value)}
                  className="flex h-9 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Timezone
                </label>
                <input
                  type="text"
                  value={bizTimezone}
                  onChange={(e) => setBizTimezone(e.target.value)}
                  className="flex h-9 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              <div className="pt-2 border-t border-border/80 flex justify-end">
                <Button type="submit" size="sm" className="gap-1 font-bold h-8 px-4">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "kb" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 border border-border rounded-lg p-3">
            {/* Search filter box */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search knowledge documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary pl-8 placeholder:text-muted-foreground/50 font-medium"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <Button onClick={() => setShowAddDoc(true)} size="sm" className="gap-1 font-bold h-8">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Document</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <div className="md:col-span-2 text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground bg-card/10 text-xs flex flex-col items-center justify-center space-y-3 py-12">
                <FileText className="h-10 w-10 text-muted-foreground/35" />
                <div>
                  <h4 className="font-bold text-foreground">Index Your First Knowledge Document</h4>
                  <p className="text-[10.5px] text-muted-foreground mt-1 max-w-sm">
                    Feed services, pricing schedules, FAQs, and refund policies into the RAG vector search database to enable automated WhatsApp replies.
                  </p>
                </div>
                <Button onClick={() => setShowAddDoc(true)} size="sm" className="font-bold gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Document</span>
                </Button>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="md:col-span-2 text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground bg-card/10 text-xs">
                No active knowledge base documents found matching your search.
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <Card key={doc.id} className="border-border bg-card/40 flex flex-col overflow-hidden hover:border-border-hover hover:bg-card transition-all">
                  <CardHeader className="pb-2 border-b border-border/40 flex flex-row items-start justify-between space-y-0 p-4 shrink-0">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xs font-bold text-foreground truncate max-w-[200px]" title={doc.title}>
                        {doc.title}
                      </CardTitle>
                      <Badge variant={getDocBadgeVariant(doc.type)} className="text-[8px] font-bold px-1.5 py-0 mt-1 uppercase tracking-wide">
                        {doc.type}
                      </Badge>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReadingDoc(doc)}
                        className="h-6 w-6 p-0 border-border/80 hover:bg-muted/15"
                        title="View Context"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="h-6 w-6 p-0 text-destructive border-destructive/20 hover:bg-destructive/15"
                        title="Delete Context"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-3 flex-1 flex flex-col justify-between">
                    <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed font-semibold">
                      {doc.content}
                    </p>
                    <div className="text-[8px] text-muted-foreground/60 font-mono mt-3 uppercase tracking-wider">
                      Indexed: {doc.uploadedAt}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === "whatsapp" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Status and linked info */}
          <Card className="border-border bg-card/40">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                Connection Status
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Active WhatsApp Business API link diagnostics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground">Gateway Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-success font-bold text-xs">Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground">Linked Number</span>
                <span className="font-mono text-foreground">{bizNumber}</span>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground">WABA ID</span>
                <span className="font-mono text-muted-foreground text-[10.5px]">waba_veda_wellness_88716</span>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full gap-1.5 h-8.5 font-bold border-border/80 cursor-not-allowed opacity-60">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reconnect Gateway Account</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Webhook keys */}
          <Card className="border-border bg-card/40">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Link className="h-4 w-4 text-primary" />
                <span>Webhook Integration Secrets</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Verify payload routing details for incoming WhatsApp hooks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-3 font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Payload Delivery URL
                  </label>
                  <div className="flex h-9 w-full rounded border border-border bg-background px-3 items-center text-[10.5px] text-muted-foreground font-mono truncate select-all">
                    https://api.flowpilot.fit/v1/webhooks/whatsapp
                  </div>
                  <p className="text-[9.5px] text-muted-foreground font-medium mt-1">
                    Register this callback URL inside the Meta App Developers Dashboard.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Verification Challenge Token
                  </label>
                  <div className="flex h-9 w-full rounded border border-border bg-background px-3 items-center text-[10.5px] text-muted-foreground font-mono select-all">
                    flowpilot_verify_secret_secure_hash
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "account" && (
        <Card className="border-border bg-card/40 max-w-lg">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              <span>Owner Account Profile</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Read-only administrator settings and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Owner Name</span>
              <div className="h-9 w-full rounded border border-border bg-background px-3 flex items-center text-foreground font-medium">
                Jai Prakash
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Owner Email Address</span>
              <div className="h-9 w-full rounded border border-border bg-background px-3 flex items-center text-foreground font-medium font-mono">
                jai.prakash@vedawellness.in
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Access Role / Permissions</span>
              <div className="flex h-9 w-full rounded border border-border bg-background px-3 items-center text-foreground font-medium">
                Owner & Primary Administrator
              </div>
            </div>
            
            <div className="p-2.5 rounded bg-info/10 border border-info/20 text-info text-[10.5px] leading-relaxed">
              Account credentials and sign-in factors are managed externally via secure SSO. Contact corporate support to request profile changes.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
export default SettingsView
