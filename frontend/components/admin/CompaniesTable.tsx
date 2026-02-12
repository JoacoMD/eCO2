"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReadContract, useWriteContract } from "wagmi";
import { eco2ContractConfig } from "@/contracts";

// Define the Project type
export type Company = {
  id: bigint;
  name: string;
  companyAddress: `0x${string}`;
  status: number;
};

export default function AdminCompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [confirmCompany, setConfirmCompany] = useState<Company | null>(null);

  const { writeContractAsync, isSuccess, error } = useWriteContract();
  const {
    data: companiesData,
    isLoading,
    refetch,
  } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getCompanies",
  });

  useEffect(() => {
    if (companiesData) {
      setCompanies((companiesData as Company[]).filter((c) => c.status === 0));
    }
  }, [companiesData]);
  // Using a separate state for modal open to control it better
  const handleRowClick = (company: Company) => {
    setSelectedCompany(company);
    setIsInternalModalOpen(true);
  };

  const openConfirmDialog = (
    e: React.MouseEvent,
    company: Company,
    action: "approve" | "reject",
  ) => {
    e.stopPropagation();
    setConfirmCompany(company);
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmCompany || !confirmAction) return;
    if (confirmAction === "approve") {
      console.log("Approve company", confirmCompany.id);
      await writeContractAsync({
        ...eco2ContractConfig,
        functionName: "approveCompany",
        args: [confirmCompany.companyAddress],
      });
      refetch();
    } else {
      console.log("Reject company", confirmCompany.id);
      await writeContractAsync({
        ...eco2ContractConfig,
        functionName: "rejectCompany",
        args: [confirmCompany.companyAddress],
      });
      refetch();
    }
    setIsConfirmOpen(false);
    setConfirmCompany(null);
    setConfirmAction(null);
  };

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Nombre de la Empresa",
    },
    {
      accessorKey: "companyAddress",
      header: "Address",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={(e) => openConfirmDialog(e, company, "approve")}
            >
              Aprobar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => openConfirmDialog(e, company, "reject")}
            >
              Rechazar
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: companies,
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
                  No hay empresas pendientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isInternalModalOpen} onOpenChange={setIsInternalModalOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              Detalles de la empresa pendiente de revisión.
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="grid gap-4 py-4">
              <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                {/* Using a simple img tag for now, ideally use Next.js Image */}
                <img
                  src={"selectedCompany.imageUrl"}
                  alt={selectedCompany.name}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium leading-none">Descripción</h4>
                <p className="text-sm text-muted-foreground">{""}</p>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={"https://example.com/proposal.pdf"}
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
            {selectedCompany && (
              <>
                <Button
                  variant="destructive"
                  onClick={(e) => {
                    if (selectedCompany)
                      openConfirmDialog(e as any, selectedCompany, "reject");
                    setIsInternalModalOpen(false);
                  }}
                >
                  Rechazar
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    if (selectedCompany)
                      openConfirmDialog(e as any, selectedCompany, "approve");
                    setIsInternalModalOpen(false);
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
              {confirmAction === "approve"
                ? "Confirmar aprobación"
                : "Confirmar rechazo"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "approve"
                ? "¿Deseas aprobar esta empresa?"
                : "¿Deseas rechazar esta empresa?"}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {confirmCompany?.name}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={confirmAction === "reject" ? "destructive" : "default"}
              className={
                confirmAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : undefined
              }
              onClick={handleConfirmAction}
            >
              {confirmAction === "approve" ? "Aprobar" : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
