"use client"

import { useState, useEffect, useMemo } from "react"
import { Copy, Save, Trash2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Professor, Template, Category, SignatureTemplate } from "@/lib/types"

interface TemplateEditorProps {
  professors: Professor[]
  selectedProfessor: Professor | null
  selectedTemplate: Template | null
  setSelectedTemplate: (template: Template | null) => void
  templates: Template[]
  setTemplates: (templates: Template[]) => void
  categories: Category[]
  signature: SignatureTemplate | null
  myName: string
}

const VARIABLES = [
  { key: "{教授の名前}", description: "選択中の教授の名前" },
  { key: "{教授のメール}", description: "選択中の教授のメールアドレス" },
  { key: "{自分の名前}", description: "あなたの名前" },
  { key: "{署名}", description: "署名テンプレート" },
  { key: "{日付}", description: "設定した日付" },
]

// Gemini APIキー
const GEMINI_API_KEY = "AIzaSyCZ2_cYmMSlWq-D4OmXh79ZUJ46lkn8WqU"

export default function TemplateEditor({
  professors,
  selectedProfessor,
  selectedTemplate,
  setSelectedTemplate,
  templates,
  setTemplates,
  categories,
  signature,
  myName,
}: TemplateEditorProps) {
  const defaultCategory = useMemo<Category>(
    () => ({
      id: "default",
      name: "その他",
      color: "#6b7280",
    }),
    [],
  )

  const initialCategory = useMemo(() => {
    if (selectedTemplate) {
      return selectedTemplate.category
    }
    if (categories && categories.length > 0) {
      const firstCategory = categories[0]
      return {
        id: firstCategory.id,
        name: firstCategory.name,
        color: firstCategory.color,
      }
    }
    return defaultCategory
  }, [selectedTemplate, categories, defaultCategory])

  const [currentTemplate, setCurrentTemplate] = useState<Template>({
    id: "",
    title: "",
    content: "",
    category: initialCategory,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(null)
  const [customDate, setCustomDate] = useState<Date>(new Date())

  // AIメール生成用の状態
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [emailPurpose, setEmailPurpose] = useState("")
  const [emailTone, setEmailTone] = useState("formal")
  const [additionalContext, setAdditionalContext] = useState("")

  // Initialize editor with selected template or professor
  useEffect(() => {
    if (selectedTemplate) {
      setCurrentTemplate({
        ...selectedTemplate,
        category: {
          id: selectedTemplate.category.id,
          name: selectedTemplate.category.name,
          color: selectedTemplate.category.color,
        },
      })
    }
  }, [selectedTemplate])

  useEffect(() => {
    if (selectedProfessor) {
      setCurrentProfessor(selectedProfessor)
    }
  }, [selectedProfessor])

  const handleSaveTemplate = () => {
    if (!currentTemplate.title.trim()) {
      toast.error("エラー", {
        description: "タイトルを入力してください",
      })
      return
    }

    if (!currentTemplate.content.trim()) {
      toast.error("エラー", {
        description: "内容を入力してください",
      })
      return
    }

    const now = Date.now()
    let updatedTemplate: Template

    if (currentTemplate.id) {
      // Update existing template
      updatedTemplate = {
        ...currentTemplate,
        updatedAt: now,
      }
      setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)))
    } else {
      // Create new template
      updatedTemplate = {
        ...currentTemplate,
        id: now.toString(),
        createdAt: now,
        updatedAt: now,
      }
      setTemplates([...templates, updatedTemplate])
    }

    setSelectedTemplate(updatedTemplate)

    toast.success("保存しました", {
      description: "テンプレートが正常に保存されました",
    })
  }

  const handleDeleteTemplate = () => {
    if (!currentTemplate.id) return

    if (window.confirm("このテンプレートを削除してもよろしいですか？")) {
      setTemplates(templates.filter((t) => t.id !== currentTemplate.id))
      setSelectedTemplate(null)
      setCurrentTemplate({
        id: "",
        title: "",
        content: "",
        category:
          categories && categories.length > 0
            ? {
                id: categories[0].id,
                name: categories[0].name,
                color: categories[0].color,
              }
            : defaultCategory,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      toast.success("削除しました", {
        description: "テンプレートが正常に削除されました",
      })
    }
  }

  const handleCopyToClipboard = () => {
    const renderedContent = getRenderedContent()
    navigator.clipboard.writeText(renderedContent)
    toast.success("コピーしました", {
      description: "テンプレートがクリップボードにコピーされました",
    })
  }

  const handleProfessorChange = (professorId: string) => {
    const professor = professors.find((p) => p.id === professorId) || null
    setCurrentProfessor(professor)
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = currentTemplate.content
    const newText = text.substring(0, start) + variable + text.substring(end)
    setCurrentTemplate({ ...currentTemplate, content: newText })

    // カーソル位置を変数の後ろに移動
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  const getRenderedContent = () => {
    if (!currentTemplate.content) return ""

    // Use custom date instead of today
    const month = customDate.getMonth() + 1
    const day = customDate.getDate()
    const formattedDate = `${month}月${day}日`

    let result = currentTemplate.content
      .replace(/{教授の名前}/g, currentProfessor?.name || "")
      .replace(/{教授のメール}/g, currentProfessor?.email || "")
      .replace(/{自分の名前}/g, myName || "")
      .replace(/{日付}/g, formattedDate)

    // 署名テンプレートを追加
    if (signature?.content) {
      result = result.replace(/{署名}/g, signature.content)
    }

    return result
  }

  // Gemini APIを使用してメールを生成する関数
  const generateEmailWithAI = async () => {
    if (!currentProfessor) {
      toast.error("エラー", {
        description: "教授を選択してください",
      })
      return
    }

    if (!emailPurpose.trim()) {
      toast.error("エラー", {
        description: "メールの目的を入力してください",
      })
      return
    }

    setIsGenerating(true)
    try {
      const month = customDate.getMonth() + 1
      const day = customDate.getDate()
      const formattedDate = `${month}月${day}日`

      // プロンプトを改修して特定のフォーマットに準拠するようにする
      const prompt = `
教授へのメールを日本語で作成してください。
以下の情報を使用してください：

教授の名前: ${currentProfessor.name}
送信者の名前: ${myName}
日付: ${formattedDate}
メールの目的: ${emailPurpose}
文体: ${emailTone === "formal" ? "丁寧で礼儀正しい" : "やや友好的でカジュアル"}
${additionalContext ? `追加情報: ${additionalContext}` : ""}

以下の2つを作成してください：
1. メールのタイトル（件名）: 簡潔で内容を表すもの。タイトルの先頭に送信者の名前を入れないでください。また、タイトルに【】（角括弧）は使用しないでください。
2. メール本文: 以下のフォーマットに従って作成

メール本文のフォーマット：
[教授の名前]教授

いつもお世話になっております。${myName}です。

[ここにメールの本文を入力]

${myName}

重要な注意点：
- メールには適切な敬称と内容を含めてください。
- 具体的で明確なメールを作成してください。
- 署名は別途挿入するので含めないでください。
- メール本文内で日付に言及する場合は、具体的な日付（${formattedDate}など）を書かずに、必ず変数 {日付} を使用してください。例えば「${formattedDate}にお伺いします」ではなく「{日付}にお伺いします」と書いてください。

レスポンスは以下のJSON形式で返してください：
{
  "title": "メールのタイトル",
  "content": "メール本文"
}
`

      // APIエンドポイントとモデル名を修正
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      )

      const data = await response.json()

      // レスポンス構造を適切に処理する
      if (data && data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        const generatedText = data.candidates[0].content.parts[0].text

        // JSONレスポンスを解析する
        try {
          // JSONを抽出するための正規表現
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
          let emailTitle = ""
          let emailContent = ""

          if (jsonMatch) {
            // JSON形式で返ってきた場合
            const jsonResponse = JSON.parse(jsonMatch[0])
            emailTitle = jsonResponse.title || ""
            emailContent = jsonResponse.content || ""
          } else {
            // JSON形式でない場合は、テキスト全体をコンテンツとして扱う
            emailContent = generatedText.trim()
          }

          // 署名の挿入位置を追加
          emailContent = emailContent.trim() + "\n\n{署名}"

          setCurrentTemplate({
            ...currentTemplate,
            title: emailTitle || currentTemplate.title,
            content: emailContent,
          })

          setIsGenerateDialogOpen(false)
          toast.success("生成完了", {
            description: "AIによるメール内容が生成されました",
          })
        } catch (parseError) {
          console.error("JSON parse error:", parseError)
          // JSON解析に失敗した場合は、テキスト全体をコンテンツとして扱う
          const emailContent = generatedText.trim() + "\n\n{署名}"

          setCurrentTemplate({
            ...currentTemplate,
            content: emailContent,
          })

          setIsGenerateDialogOpen(false)
          toast.success("生成完了", {
            description: "AIによるメール内容が生成されました（タイトルの生成に失敗しました）",
          })
        }
      } else {
        // エラー処理を強化
        console.error("Gemini API response:", data)
        if (data.error) {
          throw new Error(`メール生成エラー: ${data.error.message || "不明なエラー"}`)
        } else {
          throw new Error("メール生成に失敗しました - レスポンスが予期しない形式です")
        }
      }
    } catch (error) {
      console.error("Gemini API error:", error)
      toast.error("エラー", {
        description: error instanceof Error ? error.message : "メール生成に失敗しました。後でもう一度お試しください。",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const previewContent = useMemo(() => {
    // 設定された日付を使用
    const month = customDate.getMonth() + 1
    const day = customDate.getDate()
    const formattedDate = `${month}月${day}日`

    let content = currentTemplate.content
    if (currentProfessor) {
      content = content.replace(/{教授の名前}/g, currentProfessor.name)
      content = content.replace(/{教授のメール}/g, currentProfessor.email)
    }
    if (myName) {
      content = content.replace(/{自分の名前}/g, myName)
    }
    content = content.replace(/{日付}/g, formattedDate)
    if (signature?.content) {
      content = content.replace(/{署名}/g, signature.content)
    }
    return content
  }, [currentTemplate.content, currentProfessor, myName, signature, customDate])

  if (!selectedTemplate && !selectedProfessor) {
    return (
      <div className="text-center p-8 border rounded-lg bg-green-50">
        <p className="text-gray-500">教授またはテンプレートを選択してください。</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-green-700">
            {currentTemplate.id ? "テンプレート編集" : "新規テンプレート作成"}
          </h2>
          <div className="flex gap-2">
            {currentTemplate.id && (
              <Button variant="destructive" onClick={handleDeleteTemplate} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            )}
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  タイトル
                </label>
                <Input
                  id="title"
                  value={currentTemplate.title}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, title: e.target.value })}
                  placeholder="テンプレートのタイトル"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  カテゴリ
                </label>
                <Select
                  value={currentTemplate.category.id}
                  onValueChange={(value) => {
                    const selectedCategory = categories.find((c) => c.id === value)
                    if (selectedCategory) {
                      setCurrentTemplate({
                        ...currentTemplate,
                        category: {
                          id: selectedCategory.id,
                          name: selectedCategory.name,
                          color: selectedCategory.color,
                        },
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリ" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="content" className="block text-sm font-medium">
                  内容
                </label>
                <div className="flex gap-2">
                  <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-purple-50 hover:bg-purple-100 text-purple-700">
                        <Sparkles className="h-4 w-4 mr-2" />
                        AIで生成
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>AIでメール内容を生成</DialogTitle>
                        <DialogDescription>
                          メールの目的と内容を指定して、AIにメールのタイトルと本文を生成させましょう。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="emailPurpose">メールの目的</Label>
                          <Input
                            id="emailPurpose"
                            placeholder="例：研究室訪問のお願い、レポート提出期限の延長依頼"
                            value={emailPurpose}
                            onChange={(e) => setEmailPurpose(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="emailTone">文体</Label>
                          <Select value={emailTone} onValueChange={setEmailTone}>
                            <SelectTrigger id="emailTone">
                              <SelectValue placeholder="文体を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="formal">丁寧（フォーマル）</SelectItem>
                              <SelectItem value="casual">やや親しみやすい</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="additionalContext">追加情報（任意）</Label>
                          <Textarea
                            id="additionalContext"
                            placeholder="追加の文脈情報があれば入力してください"
                            value={additionalContext}
                            onChange={(e) => setAdditionalContext(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={generateEmailWithAI} disabled={isGenerating}>
                          {isGenerating ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                              生成中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              生成する
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Textarea
                id="content"
                value={currentTemplate.content}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, content: e.target.value })}
                placeholder="テンプレートの内容を入力してください。"
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">変数一覧</label>
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map((variable) => (
                  <Tooltip key={variable.key}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100"
                        onClick={() => insertVariable(variable.key)}
                      >
                        {variable.key}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{variable.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-green-700">プレビュー</h3>
              <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="text-green-700">
                <Copy className="h-4 w-4 mr-2" />
                コピー
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">教授を選択</label>
                <Select value={currentProfessor?.id || ""} onValueChange={handleProfessorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="教授を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">教授を選択</SelectItem>
                    {professors.map((professor) => (
                      <SelectItem key={professor.id} value={professor.id}>
                        {professor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">日付を選択</label>
                <Input
                  type="date"
                  value={customDate.toISOString().split("T")[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCustomDate(new Date(e.target.value))
                    }
                  }}
                  className="w-full"
                />
              </div>

              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="whitespace-pre-wrap">{previewContent || "プレビューが表示されます"}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
