"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { Professor } from "@/lib/types"

interface ProfessorListProps {
  professors: Professor[]
  setProfessors: (professors: Professor[]) => void
  onSelectProfessor: (professor: Professor) => void
}

export default function ProfessorList({ professors, setProfessors, onSelectProfessor }: ProfessorListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newProfessor, setNewProfessor] = useState<Omit<Professor, "id">>({ name: "", email: "" })
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null)

  const handleAddProfessor = () => {
    if (newProfessor.name.trim() === "") return

    const professor: Professor = {
      id: Date.now().toString(),
      name: newProfessor.name,
      email: newProfessor.email,
    }

    setProfessors([...professors, professor])
    setNewProfessor({ name: "", email: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditProfessor = () => {
    if (!editingProfessor || editingProfessor.name.trim() === "") return

    setProfessors(professors.map((p) => (p.id === editingProfessor.id ? editingProfessor : p)))

    setEditingProfessor(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteProfessor = (id: string) => {
    setProfessors(professors.filter((p) => p.id !== id))
  }

  const startEditing = (professor: Professor) => {
    setEditingProfessor(professor)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-700">教授リスト</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> 教授を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>教授を追加</DialogTitle>
              <DialogDescription>教授の名前とメールアドレスを入力してください。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名前
                </Label>
                <Input
                  id="name"
                  value={newProfessor.name}
                  onChange={(e) => setNewProfessor({ ...newProfessor, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  メール
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newProfessor.email}
                  onChange={(e) => setNewProfessor({ ...newProfessor, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                キャンセル
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddProfessor}>
                追加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {professors.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-green-50">
          <p className="text-gray-500">教授が登録されていません。「教授を追加」ボタンから登録してください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professors.map((professor) => (
            <Card key={professor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span className="text-green-700">{professor.name}</span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => startEditing(professor)}>
                      <Pencil className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProfessor(professor.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Mail className="h-4 w-4 mr-2" />
                  {professor.email || "メールアドレスなし"}
                </div>
                <Button
                  variant="outline"
                  className="w-full border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => onSelectProfessor(professor)}
                >
                  選択
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>教授情報を編集</DialogTitle>
          </DialogHeader>
          {editingProfessor && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  名前
                </Label>
                <Input
                  id="edit-name"
                  value={editingProfessor.name}
                  onChange={(e) => setEditingProfessor({ ...editingProfessor, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  メール
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingProfessor.email}
                  onChange={(e) => setEditingProfessor({ ...editingProfessor, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleEditProfessor}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

