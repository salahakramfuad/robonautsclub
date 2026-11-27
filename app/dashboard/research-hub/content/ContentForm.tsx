'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABELS,
  MAX_HUB_PHOTOS,
  type InventoryCategory,
  type InventoryItem,
  type ResearchHubContent,
} from '@/lib/research-hub/shared'
import { saveResearchHubContentAction } from '../actions'

/** A starting list staff can load and then edit — saves typing the common parts. */
const STARTER_INVENTORY: Array<Omit<InventoryItem, 'id'>> = [
  { name: 'Arduino Uno', category: 'boards', quantity: 10, note: '' },
  { name: 'ESP32 dev board', category: 'boards', quantity: 8, note: 'Wi-Fi + Bluetooth' },
  { name: 'Raspberry Pi 4', category: 'boards', quantity: 2, note: '' },
  { name: 'Line follower robot kit', category: 'kits', quantity: 6, note: '' },
  { name: '2WD / 4WD chassis kit', category: 'kits', quantity: 6, note: '' },
  { name: 'Ultrasonic sensor (HC-SR04)', category: 'sensors', quantity: 15, note: '' },
  { name: 'IR sensor module', category: 'sensors', quantity: 20, note: '' },
  { name: 'Servo & DC motors', category: 'components', quantity: null, note: 'SG90, MG996R, BO motors' },
  { name: 'Motor drivers (L298N)', category: 'components', quantity: 10, note: '' },
  { name: 'Breadboards & jumper wires', category: 'components', quantity: null, note: '' },
  { name: 'Resistors, LEDs, capacitors', category: 'components', quantity: null, note: '' },
  { name: 'Soldering station', category: 'tools', quantity: 4, note: '' },
  { name: 'Digital multimeter', category: 'tools', quantity: 6, note: '' },
  { name: 'Bench power supply', category: 'equipment', quantity: 2, note: '' },
]

function newKey() {
  return Math.random().toString(36).slice(2, 12)
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          {hint ? <p className="mt-0.5 text-sm text-slate-600">{hint}</p> : null}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

export default function ContentForm({ initial }: { initial: ResearchHubContent }) {
  const router = useRouter()
  const [c, setC] = useState(initial)
  const [rulesEn, setRulesEn] = useState(initial.rulesEn.join('\n'))
  const [rulesBn, setRulesBn] = useState(initial.rulesBn.join('\n'))
  const [saving, startSave] = useTransition()
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const setItem = (id: string, patch: Partial<InventoryItem>) =>
    setC((prev) => ({ ...prev, inventory: prev.inventory.map((i) => (i.id === id ? { ...i, ...patch } : i)) }))
  const moveItem = (index: number, delta: number) =>
    setC((prev) => {
      const next = [...prev.inventory]
      const target = index + delta
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...prev, inventory: next }
    })

  async function uploadPhotos(files: FileList | null) {
    if (!files?.length) return
    const room = MAX_HUB_PHOTOS - c.photos.length
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_HUB_PHOTOS} photos.`)
      return
    }
    setUploading(true)
    try {
      for (const file of Array.from(files).slice(0, room)) {
        const form = new FormData()
        form.append('image', file)
        form.append('folder', 'researchHub')
        const res = await fetch('/api/upload-image', { method: 'POST', body: form })
        const data = (await res.json()) as { secure_url?: string; error?: string }
        if (!res.ok || !data.secure_url) throw new Error(data.error || 'Upload failed')
        setC((prev) => ({ ...prev, photos: [...prev.photos, { url: data.secure_url!, alt: '' }] }))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  function save() {
    startSave(async () => {
      const result = await saveResearchHubContentAction({
        ...c,
        rulesEn: rulesEn.split('\n'),
        rulesBn: rulesBn.split('\n'),
      })
      if (result.success) {
        toast.success('Page content saved')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <Section
        title="Photos of the space"
        hint={`Up to ${MAX_HUB_PHOTOS}. The first photo is the large one at the top of the page. Wide (landscape) photos work best.`}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {c.photos.map((photo, i) => (
            <div key={photo.url} className="space-y-1.5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                <Image src={photo.url} alt={photo.alt} fill sizes="240px" className="object-cover" />
                {i === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium">
                    Main photo
                  </span>
                ) : null}
              </div>
              <Input
                aria-label={`Photo ${i + 1} description`}
                placeholder="Describe the photo"
                value={photo.alt}
                onChange={(e) =>
                  setC((prev) => ({
                    ...prev,
                    photos: prev.photos.map((p, j) => (j === i ? { ...p, alt: e.target.value } : p)),
                  }))
                }
              />
              <div className="flex justify-between">
                <div className="flex">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Move earlier"
                    disabled={i === 0}
                    onClick={() =>
                      setC((prev) => {
                        const next = [...prev.photos]
                        ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                        return { ...prev, photos: next }
                      })
                    }
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Move later"
                    disabled={i === c.photos.length - 1}
                    onClick={() =>
                      setC((prev) => {
                        const next = [...prev.photos]
                        ;[next[i + 1], next[i]] = [next[i], next[i + 1]]
                        return { ...prev, photos: next }
                      })
                    }
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Remove photo"
                  onClick={() => setC((prev) => ({ ...prev, photos: prev.photos.filter((_, j) => j !== i) }))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {c.photos.length < MAX_HUB_PHOTOS ? (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-600 hover:border-sky-500 hover:text-sky-700"
            >
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
              {uploading ? 'Uploading…' : 'Add photos'}
            </button>
          ) : null}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => uploadPhotos(e.target.files)}
        />
      </Section>

      <Section
        title="Kits, components and equipment"
        hint="Shown on the page grouped by category. Leave quantity empty for things you don't count (like resistors)."
      >
        {c.inventory.length === 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            No items yet.
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setC((prev) => ({ ...prev, inventory: STARTER_INVENTORY.map((i) => ({ ...i, id: newKey() })) }))
              }
            >
              Load a starter list to edit
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="w-24 pb-2 font-medium">Quantity</th>
                  <th className="pb-2 font-medium">Note</th>
                  <th className="w-28 pb-2" />
                </tr>
              </thead>
              <tbody>
                {c.inventory.map((item, i) => (
                  <tr key={item.id} className="align-top">
                    <td className="py-1 pr-2">
                      <Input
                        aria-label="Name"
                        value={item.name}
                        onChange={(e) => setItem(item.id, { name: e.target.value })}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <select
                        aria-label="Category"
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2"
                        value={item.category}
                        onChange={(e) => setItem(item.id, { category: e.target.value as InventoryCategory })}
                      >
                        {INVENTORY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {INVENTORY_CATEGORY_LABELS[cat]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1 pr-2">
                      <Input
                        aria-label="Quantity"
                        type="number"
                        min={0}
                        value={item.quantity ?? ''}
                        onChange={(e) =>
                          setItem(item.id, { quantity: e.target.value === '' ? null : e.target.valueAsNumber })
                        }
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <Input
                        aria-label="Note"
                        placeholder="Optional"
                        value={item.note}
                        onChange={(e) => setItem(item.id, { note: e.target.value })}
                      />
                    </td>
                    <td className="py-1">
                      <div className="flex">
                        <Button type="button" size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => moveItem(i, -1)}>
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Move down"
                          disabled={i === c.inventory.length - 1}
                          onClick={() => moveItem(i, 1)}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Remove item"
                          onClick={() =>
                            setC((prev) => ({ ...prev, inventory: prev.inventory.filter((x) => x.id !== item.id) }))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setC((prev) => ({
              ...prev,
              inventory: [...prev.inventory, { id: newKey(), name: '', category: 'components', quantity: null, note: '' }],
            }))
          }
        >
          <Plus className="size-4" /> Add item
        </Button>
      </Section>

      <Section title="Introduction" hint="The paragraph under the page title. Leave empty to use the default text.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="intro-en">English</Label>
            <Textarea id="intro-en" rows={4} value={c.introEn} onChange={(e) => setC({ ...c, introEn: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="intro-bn">Bangla</Label>
            <Textarea id="intro-bn" rows={4} value={c.introBn} onChange={(e) => setC({ ...c, introBn: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title="House rules" hint="One rule per line. Leave empty to use the default rules.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rules-en">English</Label>
            <Textarea id="rules-en" rows={7} value={rulesEn} onChange={(e) => setRulesEn(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rules-bn">Bangla</Label>
            <Textarea id="rules-bn" rows={7} value={rulesBn} onChange={(e) => setRulesBn(e.target.value)} />
          </div>
        </div>
      </Section>

      <div className="sticky bottom-3 z-20 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="text-sm text-slate-500">Changes show on the public page right after saving.</span>
          <Button onClick={save} disabled={saving || uploading}>
            {saving ? 'Saving…' : 'Save page content'}
          </Button>
        </div>
      </div>
    </div>
  )
}
