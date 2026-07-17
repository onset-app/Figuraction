"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Send } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { sendConvocation } from "@/actions/emails"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type ConvocationInput, convocationSchema } from "@/schemas/convocation"

/**
 * Production-side action to send a convocation email to every confirmed
 * figurant of a project. The recipient list is resolved server-side by
 * `sendConvocation` — this form only collects the shoot logistics.
 */
export function ConvocationDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConvocationInput>({
    resolver: zodResolver(convocationSchema),
    defaultValues: { projectId },
  })

  async function onSubmit(values: ConvocationInput) {
    const result = await sendConvocation(values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    if (result.sent === 0) {
      toast.warning("Aucun figurant confirmé à convoquer pour ce projet.")
    } else {
      toast.success(
        result.sent === 1
          ? "Convocation envoyée à 1 figurant."
          : `Convocation envoyée à ${result.sent} figurants.`
      )
    }
    reset({ projectId })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Send className="size-4" /> Envoyer une convocation
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convoquer les figurants confirmés</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <input type="hidden" {...register("projectId")} />

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input id="location" placeholder="Studio, plateau…" {...register("location")} />
            {errors.location && (
              <p className="text-destructive text-sm">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" placeholder="Rue, numéro, ville" {...register("address")} />
            {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-destructive text-sm">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Heure de convocation</Label>
              <Input id="time" type="time" {...register("time")} />
              {errors.time && <p className="text-destructive text-sm">{errors.time.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Consignes</Label>
            <Textarea
              id="instructions"
              rows={4}
              placeholder="Tenue, accessoires, choses à prévoir…"
              {...register("instructions")}
            />
            {errors.instructions && (
              <p className="text-destructive text-sm">{errors.instructions.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact sur place</Label>
              <Input id="contactName" placeholder="Prénom Nom" {...register("contactName")} />
              {errors.contactName && (
                <p className="text-destructive text-sm">{errors.contactName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Téléphone du contact</Label>
              <Input id="contactPhone" type="tel" {...register("contactPhone")} />
              {errors.contactPhone && (
                <p className="text-destructive text-sm">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Envoi…" : "Envoyer la convocation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
