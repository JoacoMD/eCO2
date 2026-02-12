'use client';

import { useEffect, useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useReadContract, useWriteContract } from 'wagmi';
import { eco2ContractConfig } from '@/contracts';

// Define the Project type
export type Project = {
    id: bigint;
    name: string;
    projectAddress: `0x${string}`;
    milestones: readonly bigint[];
    completedMilestones: bigint;
    status: number;
}


export default function AdminProjectsTable() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
    const [confirmProject, setConfirmProject] = useState<Project | null>(null);

    const {writeContractAsync, isSuccess, error} = useWriteContract()
    const {data: projectsData, isLoading, refetch} = useReadContract({
        ...eco2ContractConfig,
        functionName: "getProjects"
    })

    useEffect(() => {
        if (projectsData) {
            setProjects((projectsData as Project[]).filter((p => p.status === 0)))
        }
    }, [projectsData]);

    // Using a separate state for modal open to control it better
    const handleRowClick = (project: Project) => {
        setSelectedProject(project);
        setIsInternalModalOpen(true);
    };

    const openConfirmDialog = (e: React.MouseEvent, project: Project, action: 'approve' | 'reject') => {
        e.stopPropagation(); // Prevent row click
        setConfirmProject(project);
        setConfirmAction(action);
        setIsConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!confirmProject || !confirmAction) return;
        if (confirmAction === 'approve') {
            console.log("Approve project", confirmProject.id);
            await writeContractAsync({
                ...eco2ContractConfig,
                functionName: "approveProject",
                args: [confirmProject.projectAddress]
            })            
            refetch();
        } else {
            console.log("Reject project", confirmProject.id);
            await writeContractAsync({
                ...eco2ContractConfig,
                functionName: "rejectProject",
                args: [confirmProject.projectAddress]
            })            
            refetch();
        }
        setIsConfirmOpen(false);
        setConfirmProject(null);
        setConfirmAction(null);
    };

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
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const project = row.original;
                return (
                    <div className="flex gap-2">
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => openConfirmDialog(e, project, 'approve')}
                        >
                            Aprobar
                        </Button>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={(e) => openConfirmDialog(e, project, 'reject')}
                        >
                            Rechazar
                        </Button>
                    </div>
                )
            }
        }
    ];

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
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
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
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No hay proyectos pendientes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isInternalModalOpen} onOpenChange={setIsInternalModalOpen}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>{selectedProject?.name}</DialogTitle>
                        <DialogDescription>
                            Detalles del proyecto pendiente de revisión.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedProject && (
                        <div className="grid gap-4 py-4">
                            <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                                {/* Using a simple img tag for now, ideally use Next.js Image */}
                                <img 
                                    src={"selectedProject.imageUrl"} 
                                    alt={selectedProject.name} 
                                    className="object-cover w-full h-full" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Descripción</h4>
                                <p className="text-sm text-muted-foreground">
                                    {/* {selectedProject.description} */}
                                    Descripción del proyecto va aquí. Esta es una descripción de ejemplo para ilustrar cómo se verá el texto en este espacio.
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <a 
                                    href={"selectedProject.proposalPdfUrl"} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm flex items-center"
                                >
                                    📄 Ver Propuesta Completa (PDF)
                                </a>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {selectedProject && (
                            <>
                                <Button 
                                    variant="destructive"
                                    onClick={(e) => {
                                        if (selectedProject) {
                                            openConfirmDialog(e as any, selectedProject, 'reject');
                                            setIsInternalModalOpen(false);
                                        }
                                    }}
                                >
                                    Rechazar
                                </Button>
                                <Button 
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={(e) => {
                                        if (selectedProject) {
                                            openConfirmDialog(e as any, selectedProject, 'approve');
                                            setIsInternalModalOpen(false);
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

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-105">
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction === 'approve' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmAction === 'approve'
                                ? '¿Deseas aprobar este proyecto?'
                                : '¿Deseas rechazar este proyecto?'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground">
                        {confirmProject?.name}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant={confirmAction === 'reject' ? 'destructive' : 'default'}
                            className={confirmAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : undefined}
                            onClick={handleConfirmAction}
                        >
                            {confirmAction === 'approve' ? 'Aprobar' : 'Rechazar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}