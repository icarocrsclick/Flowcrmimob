import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, Eye, Replace, Trash2, ImageIcon, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface Documento {
  id: string
  tipo_documento: string
  url: string
  nome_arquivo: string
  data_upload: string
}

interface Captacao {
  id: string
  owner_name: string
  address: string
  property_type: string
}

interface ChecklistItem {
  id: string
  tipo_documento: string
  marcado: boolean
  data_marcado?: string
}

interface DocumentType {
  key: string
  label: string
  required: boolean
  multiple: boolean
}

const DOCUMENT_TYPES: DocumentType[] = [
  { key: "matricula", label: "Matrícula Atualizada do Imóvel", required: true, multiple: false },
  { key: "iptu_negativa", label: "Certidão Negativa de Débitos de IPTU", required: true, multiple: false },
  { key: "iptu_dados", label: "Certidão de Dados Cadastrais - IPTU", required: true, multiple: false },
  { key: "condominio_negativa", label: "Certidão Negativa de Débitos do Condomínio", required: false, multiple: false },
]

const OWNER_DOCUMENT_TYPES: DocumentType[] = [
  { key: "identidade", label: "Documento de Identidade (RG ou CNH)", required: true, multiple: false },
  { key: "cpf", label: "CPF", required: true, multiple: false },
  { key: "certidao_civil", label: "Certidão de Nascimento ou Casamento", required: true, multiple: false },
  { key: "certidao_interdicao", label: "Certidão de Interdição e Tutela", required: true, multiple: false },
  { key: "certidoes_judiciais", label: "Certidões Judiciais (Municipal, Estadual, Federal)", required: true, multiple: true },
]

const DocumentacaoImovel = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [captacao, setCaptacao] = useState<Captacao | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  useEffect(() => {
    if (id) {
      loadCaptacao()
      loadDocumentos()
    }
  }, [id])

  const loadCaptacao = async () => {
    if (!id) return

    const { data, error } = await supabase
      .from("captacoes")
      .select("id, owner_name, address, property_type")
      .eq("id", id)
      .single()

    if (error) {
      toast({
        title: "Erro",
        description: "Imóvel não encontrado",
        variant: "destructive",
      })
      navigate("/captacoes")
      return
    }

    setCaptacao(data)
  }

  const loadDocumentos = async () => {
    if (!id) return

    const { data, error } = await supabase
      .from("documentos_imovel")
      .select("*")
      .eq("imovel_id", id)
      .order("data_upload", { ascending: false })

    if (error) {
      console.error("Erro ao carregar documentos:", error)
      return
    }

    setDocumentos(data || [])
    setLoading(false)
    
    // Load signed URLs for photos
    const fotos = (data || []).filter(doc => doc.tipo_documento === "fotos")
    if (fotos.length > 0) {
      loadPhotoUrls(fotos)
    }
  }

  const loadPhotoUrls = async (fotos: Documento[]) => {
    setLoadingPhotos(true)
    const urls: Record<string, string> = {}
    
    for (const foto of fotos) {
      const { data } = await supabase.storage
        .from('property-documents')
        .createSignedUrl(foto.url, 3600) // 1 hour expiry
      
      if (data?.signedUrl) {
        urls[foto.id] = data.signedUrl
      }
    }
    
    setPhotoUrls(urls)
    setLoadingPhotos(false)
  }

  const handleFileUpload = async (file: File, tipoDocumento: string) => {
    if (!id || !user) return

    setUploading(tipoDocumento)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${id}/${tipoDocumento}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      const { error: dbError } = await supabase
        .from("documentos_imovel")
        .insert({
          imovel_id: id,
          tipo_documento: tipoDocumento,
          url: fileName,
          nome_arquivo: file.name,
          user_id: user.id,
        })

      if (dbError) {
        throw dbError
      }

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      })

      loadDocumentos()
    } catch (error) {
      console.error("Erro no upload:", error)
      toast({
        title: "Erro",
        description: "Erro ao enviar documento",
        variant: "destructive",
      })
    } finally {
      setUploading(null)
    }
  }

  const handleMultipleFileUpload = async (files: FileList, tipoDocumento: string) => {
    for (let i = 0; i < files.length; i++) {
      await handleFileUpload(files[i], tipoDocumento)
    }
  }

  const viewDocument = async (documento: Documento) => {
    const { data } = await supabase.storage
      .from('property-documents')
      .createSignedUrl(documento.url, 60)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  const deleteDocument = async (documento: Documento) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return

    try {
      await supabase.storage
        .from('property-documents')
        .remove([documento.url])

      await supabase
        .from("documentos_imovel")
        .delete()
        .eq("id", documento.id)

      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso",
      })

      loadDocumentos()
    } catch (error) {
      console.error("Erro ao excluir documento:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir documento",
        variant: "destructive",
      })
    }
  }

  const getDocumentosForType = (tipo: string) => {
    return documentos.filter(doc => doc.tipo_documento === tipo)
  }

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  const renderDocumentCard = (docType: DocumentType, existingDocs: Documento[]) => {
    const hasDocument = existingDocs.length > 0
    const isUploading = uploading === docType.key

    return (
      <Card key={docType.key} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium">{docType.label}</h4>
            {docType.required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
          </div>
          <Badge variant={hasDocument ? "default" : "secondary"}>
            {hasDocument ? "Enviado" : "Pendente"}
          </Badge>
        </div>

        {existingDocs.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 p-2 bg-muted rounded mb-2">
            {isImageFile(doc.nome_arquivo) && (
              <div className="w-12 h-12 rounded overflow-hidden bg-background flex-shrink-0">
                <img
                  src={photoUrls[doc.id] || ''}
                  alt={doc.nome_arquivo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{doc.nome_arquivo}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(doc.data_upload).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => viewDocument(doc)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => deleteDocument(doc)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple={docType.multiple}
            onChange={(e) => {
              const files = e.target.files
              if (files) {
                if (docType.multiple) {
                  handleMultipleFileUpload(files, docType.key)
                } else {
                  handleFileUpload(files[0], docType.key)
                }
              }
            }}
            className="hidden"
            id={`upload-${docType.key}`}
            disabled={isUploading}
          />
          <label htmlFor={`upload-${docType.key}`} className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isUploading ? "Enviando..." : `Clique para ${hasDocument ? "substituir" : "enviar"}`}
            </p>
            <p className="text-xs text-muted-foreground">PDF, JPG ou PNG</p>
          </label>
        </div>
      </Card>
    )
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  if (!captacao) {
    return <div className="p-8">Imóvel não encontrado</div>
  }

  const fotos = getDocumentosForType("fotos")

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate("/captacoes")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Documentação do Imóvel</h1>
          <p className="text-muted-foreground">
            {captacao.owner_name} - {captacao.address}
          </p>
        </div>
      </div>

      <Tabs defaultValue="imovel" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="imovel">Documentação do Imóvel</TabsTrigger>
          <TabsTrigger value="proprietario">Documentação do Proprietário</TabsTrigger>
          <TabsTrigger value="fotos">Fotos do Imóvel</TabsTrigger>
        </TabsList>

        <TabsContent value="imovel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {DOCUMENT_TYPES.map((docType) => 
              renderDocumentCard(docType, getDocumentosForType(docType.key))
            )}
          </div>
        </TabsContent>

        <TabsContent value="proprietario" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {OWNER_DOCUMENT_TYPES.map((docType) => 
              renderDocumentCard(docType, getDocumentosForType(docType.key))
            )}
          </div>
        </TabsContent>

        <TabsContent value="fotos" className="space-y-4">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Galeria de Fotos
              </CardTitle>
              <CardDescription>
                Adicione fotos do imóvel para a apresentação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center mb-4">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files
                    if (files) {
                      handleMultipleFileUpload(files, "fotos")
                    }
                  }}
                  className="hidden"
                  id="upload-fotos"
                  disabled={uploading === "fotos"}
                />
                <label htmlFor="upload-fotos" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {uploading === "fotos" ? "Enviando fotos..." : "Adicionar Fotos"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: JPG, PNG
                  </p>
                </label>
              </div>

              {loadingPhotos && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Carregando fotos...</p>
                </div>
              )}

              {fotos.length > 0 && !loadingPhotos && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {fotos.map((foto) => (
                    <div key={foto.id} className="relative group">
                      <div 
                        className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => viewDocument(foto)}
                      >
                        {photoUrls[foto.id] ? (
                          <img
                            src={photoUrls[foto.id]}
                            alt={foto.nome_arquivo}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteDocument(foto)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{foto.nome_arquivo}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DocumentacaoImovel