"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfessorList from "@/components/professor-list"
import TemplateList from "@/components/template-list"
import TemplateEditor from "@/components/template-editor"
import CategoryManager from "@/components/category-manager"
import type { Professor, Template, Category, SignatureTemplate } from "@/lib/types"
import { DEFAULT_CATEGORIES } from "@/lib/constants"
import NameSetupDialog from "@/components/name-setup-dialog"
import SignatureSetupDialog from "@/components/signature-setup-dialog"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [professors, setProfessors] = useState<Professor[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [activeTab, setActiveTab] = useState("professors")
  const [myName, setMyName] = useState("")
  const [showNameSetup, setShowNameSetup] = useState(false)
  const [signature, setSignature] = useState<SignatureTemplate | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // カテゴリーの読み込み
  useEffect(() => {
    if (mounted) {
      try {
        const savedCategories = localStorage.getItem("categories")
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories)
          if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
            setCategories(parsedCategories)
          }
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }
  }, [mounted])

  // テンプレートの読み込み
  useEffect(() => {
    if (mounted && Array.isArray(categories) && categories.length > 0) {
      try {
        const savedTemplates = localStorage.getItem("templates")
        if (savedTemplates) {
          const parsedTemplates = JSON.parse(savedTemplates)
          const updatedTemplates = parsedTemplates.map((template: Template) => ({
            ...template,
            category: categories.find((c) => c.id === template.category.id) || categories[0],
          }))
          setTemplates(updatedTemplates)
        }
      } catch (error) {
        console.error("Error loading templates:", error)
      }
    }
  }, [mounted, categories])

  // 教授情報の読み込み
  useEffect(() => {
    if (mounted) {
      try {
        const savedProfessors = localStorage.getItem("professors")
        if (savedProfessors) {
          setProfessors(JSON.parse(savedProfessors))
        }
      } catch (error) {
        console.error("Error loading professors:", error)
      }
    }
  }, [mounted])

  // 名前の読み込み
  useEffect(() => {
    if (mounted) {
      try {
        const savedName = localStorage.getItem("myName")
        if (savedName) {
          setMyName(savedName)
        } else {
          setShowNameSetup(true)
        }
      } catch (error) {
        console.error("Error loading name:", error)
        setShowNameSetup(true)
      }
    }
  }, [mounted])

  // 署名の読み込み
  useEffect(() => {
    if (mounted) {
      try {
        const savedSignature = localStorage.getItem("signature")
        if (savedSignature) {
          setSignature(JSON.parse(savedSignature))
        }
      } catch (error) {
        console.error("Error loading signature:", error)
      }
    }
  }, [mounted])

  // データの保存
  useEffect(() => {
    if (mounted && categories.length > 0) {
      localStorage.setItem("categories", JSON.stringify(categories))
    }
  }, [categories, mounted])

  useEffect(() => {
    if (mounted && templates.length > 0) {
      localStorage.setItem("templates", JSON.stringify(templates))
    }
  }, [templates, mounted])

  useEffect(() => {
    if (mounted && professors.length > 0) {
      localStorage.setItem("professors", JSON.stringify(professors))
    }
  }, [professors, mounted])

  const handleSelectProfessor = (professor: Professor) => {
    setSelectedProfessor(professor)
    if (activeTab !== "editor") {
      setActiveTab("editor")
    }
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    if (activeTab !== "editor") {
      setActiveTab("editor")
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4 space-y-8">
      <NameSetupDialog
        open={showNameSetup}
        onOpenChange={setShowNameSetup}
        onNameSet={setMyName}
      />
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700"
            onClick={() => setShowNameSetup(true)}
          >
            自分の名前を設定
          </Button>
          <SignatureSetupDialog />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-green-50">
          <TabsTrigger value="professors" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            教授リスト
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            テンプレート
          </TabsTrigger>
          <TabsTrigger value="editor" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            エディタ
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            カテゴリ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="professors" className="mt-4">
          <ProfessorList
            professors={professors}
            setProfessors={setProfessors}
            onSelectProfessor={handleSelectProfessor}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplateList 
            templates={templates} 
            setTemplates={setTemplates} 
            onSelectTemplate={handleSelectTemplate}
            categories={categories}
          />
        </TabsContent>

        <TabsContent value="editor" className="mt-4">
          <TemplateEditor
            professors={professors}
            selectedProfessor={selectedProfessor}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            templates={templates}
            setTemplates={setTemplates}
            categories={categories}
            signature={signature}
            myName={myName}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoryManager
            categories={categories}
            setCategories={setCategories}
            templates={templates}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}


