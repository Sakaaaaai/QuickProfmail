"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Pencil } from "lucide-react"
import { type Category, type Template } from "@/lib/types"
import { toast } from "sonner"

interface CategoryManagerProps {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  templates: Template[]
}

export default function CategoryManager({ categories, setCategories, templates }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#6b7280")

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("エラー", {
        description: "カテゴリー名を入力してください",
      })
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    }

    setCategories([...categories, newCategory])
    setNewCategoryName("")
    setNewCategoryColor("#6b7280")

    toast.success("追加しました", {
      description: "カテゴリーが正常に追加されました",
    })
  }

  const handleDeleteCategory = (categoryId: string) => {
    // カテゴリーが使用されているかチェック
    const isUsed = templates.some(template => template.category.id === categoryId)
    if (isUsed) {
      toast.error("エラー", {
        description: "このカテゴリーは使用中のため削除できません",
      })
      return
    }

    setCategories(categories.filter((category) => category.id !== categoryId))
    toast.success("削除しました", {
      description: "カテゴリーが正常に削除されました",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="カテゴリー名"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="h-10 cursor-pointer"
              />
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                追加
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="relative group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
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
        </CardContent>
      </Card>
    </div>
  )
} 