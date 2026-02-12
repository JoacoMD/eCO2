"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";

export type Milestone = {
  id: number;
  title?: string;
  url?: string;
  completed?: boolean;
};

interface MilestonesSectionProps {
  milestones: Milestone[];
  onAddMilestone: (milestone: Milestone) => void;
  onRemoveMilestone: (id: number) => void;
}

export default function MilestonesSection({
  milestones,
  onAddMilestone,
  onRemoveMilestone,
}: MilestonesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneUrl, setMilestoneUrl] = useState("");

  const handleAddMilestone = () => {
    if (milestoneTitle.trim() && milestoneUrl.trim()) {
      const newMilestone: Milestone = {
        id: Date.now(),
        title: milestoneTitle,
        url: milestoneUrl,
        completed: false,
      };
      onAddMilestone(newMilestone);
      setMilestoneTitle("");
      setMilestoneUrl("");
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="w-full mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Milestones</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Milestone
          </Button>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-muted-foreground">
              No hay milestones registrados. Agrega uno para comenzar.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          milestone.completed
                            ? "bg-green-600 border-green-600"
                            : "border-gray-300"
                        }`}
                      >
                        {milestone.completed && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{milestone.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {milestone.url && (
                            <a
                              href={milestone.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Ver más
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {milestone.completed ? "Completado" : "Pendiente"}
                        </p>
                      </div>
                    </div>
                    {!milestone.completed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMilestone(milestone.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Milestone</DialogTitle>
            <DialogDescription>
              Ingresa el título y URL del nuevo milestone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="milestone-title" className="text-sm font-medium">
                Título del Milestone
              </label>
              <Input
                id="milestone-title"
                type="text"
                placeholder="Ej: Primera Fase"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="milestone-url" className="text-sm font-medium">
                URL / Enlace
              </label>
              <Input
                id="milestone-url"
                type="url"
                placeholder="https://ejemplo.com"
                value={milestoneUrl}
                onChange={(e) => setMilestoneUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddMilestone}
              disabled={!milestoneTitle.trim() || !milestoneUrl.trim()}
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
