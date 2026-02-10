"use client"

import { useState, useMemo } from "react"
import { Plus, Star, Search, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { type Template, type Category } from "@/lib/types"
import { toast } from "sonner"

interface TemplateListProps {
  templates: Template[]
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>
  onSelectTemplate: (template: Template) => void
  categories: Category[]
}

export default function TemplateList({ templates, setTemplates, onSelectTemplate, categories }: TemplateListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const filteredTemplates = useMemo(() => {
    if (categoryFilter === "all") {
      return templates
    }
    return templates.filter((template) => template.category.id === categoryFilter)
  }, [templates, categoryFilter])

  const handleToggleFavorite = (templateId: string) => {
    setTemplates((prevTemplates: Template[]) =>
      prevTemplates.map((template: Template) =>
        template.id === templateId
          ? { ...template, isFavorite: !template.isFavorite }
          : template
      )
    )
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm("このテンプレートを削除してもよろしいですか？")) {
      setTemplates((prevTemplates: Template[]) => prevTemplates.filter((t: Template) => t.id !== templateId))
      toast.success("削除しました", {
        description: "テンプレートが正常に削除されました",
      })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-700">テンプレート一覧</h2>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map((category) => (
                <SelectItem key={`filter-${category.id}`} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() =>
            onSelectTemplate({
              id: "",
              title: "",
              content: "",
              category: Array.isArray(categories) && categories.length > 0 ? categories[0] : {
                id: "default",
                name: "その他",
                color: "#6b7280"
              },
              isFavorite: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          }>
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: template.category.color }}
                    />
                    <span className="text-sm text-gray-500">{template.category.name}</span>
                  </div>
                  <h3 className="font-medium">{template.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{template.content}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFavorite(template.id)}
                    className="h-8 w-8"
                  >
                    <Star className={`h-4 w-4 ${template.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectTemplate(template)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

