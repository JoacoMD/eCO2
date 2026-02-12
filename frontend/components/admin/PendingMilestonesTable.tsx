"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Project } from "./ProjectsTable";
import { ColumnDef, getCoreRowModel } from "@tanstack/table-core";
import { flexRender, useReactTable } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { eco2ContractConfig } from "@/contracts";
import { BaseError, useReadContract, useWriteContract } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Spinner } from "../ui/spinner";
import { VisuallyHidden } from "radix-ui";
import { toast } from "sonner";

export default function PendingMilestonesTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMilestonesDialogOpen, setIsMilestonesDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { data: projectsData, refetch } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getProjects",
  });
  const { writeContractAsync, isPending, isSuccess, error } =
    useWriteContract();

  useEffect(() => {
    if (projectsData) {
      setProjects((projectsData as Project[]).filter((p) => p.status === 1));
    }
  }, [projectsData]);

  useEffect(() => {
    if (error) {
      toast.error(
        `Transaction failed: ${(error as BaseError).shortMessage || error.message}`,
      );
    }
  }, [error]);

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Nombre del Proyecto",
    },
    {
      accessorKey: "projectAddress",
      header: "Address",
    },
    {
      id: "milestones_pending",
      header: "Pending Milestones",
      cell: ({ row }) => {
        const project = row.original;
        const numberOfPendingMilestones =
          project.milestones.length - Number(project.completedMilestones);
        return (
          <div className="flex gap-2">
            {numberOfPendingMilestones} waiting verification
          </div>
        );
      },
    },
  ];

  const handleRowClick = (project: Project) => {
    setSelectedProject(project);
    setIsMilestonesDialogOpen(true);
  };

  const handleConfirmAction = async (selectedProject: Project) => {
    await writeContractAsync({
      ...eco2ContractConfig,
      functionName: "verifyMilestone",
      args: [selectedProject.projectAddress],
    });
    refetch();
    setIsMilestonesDialogOpen(false);
  };

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay proyectos con milestones pendientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={isMilestonesDialogOpen}
        onOpenChange={setIsMilestonesDialogOpen}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              Milestone{" "}
              {selectedProject
                ? Number(selectedProject.completedMilestones) + 1
                : 0}
            </DialogTitle>
            <DialogDescription>
              Detalles del milestone de {selectedProject?.name} pendiente de
              revisión.
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Descripción</h4>
                <p className="text-sm text-muted-foreground">
                  {/* {selectedProject.description} */}
                  Descripción del proyecto va aquí. Esta es una descripción de
                  ejemplo para ilustrar cómo se verá el texto en este espacio.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={"selectedProject.proposalPdfUrl"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  📄 Ver archivo (PDF)
                </a>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedProject && (
              <>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    if (selectedProject) {
                      handleConfirmAction(selectedProject);
                    }
                  }}
                >
                  Aprobar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPending}>
        <DialogContent
          showCloseButton={false}
          className="flex items-center gap-2 w-fit"
        >
          <VisuallyHidden.Root>
            <DialogTitle>Processing Transaction</DialogTitle>
          </VisuallyHidden.Root>
          <Spinner className="size-6" /> Processing...
        </DialogContent>
      </Dialog>
    </div>
  );
}
