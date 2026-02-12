"use client";

import { use, useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { BaseError, useReadContract, useWriteContract } from "wagmi";
import { eco2ContractConfig } from "@/contracts";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Define the Project type
export type User = {
  address: `0x${string}`;
};

export default function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserAddress, setNewUserAddress] = useState("");
  const {
    data: usersData,
    isLoading,
    refetch,
  } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getAdministrators",
  });
  const { data: owner, isLoading: isOwnerLoading } = useReadContract({
    ...eco2ContractConfig,
    functionName: "owner",
  });

  const {writeContractAsync, error} = useWriteContract()

  useEffect(() => {
    if (isLoading || isOwnerLoading) return;
    if (usersData) {
      setUsers(
        usersData
          .filter((address: `0x${string}`) => address !== owner)
          .map((address: `0x${string}`) => ({ address })),
      );
    }
  }, [usersData, owner, isLoading, isOwnerLoading]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${(error as BaseError).message}`);
    }
  }, [error]);

  const handleRemoveUser = async (e: React.MouseEvent, address: `0x${string}`) => {
    e.stopPropagation(); 
    await writeContractAsync({
      ...eco2ContractConfig,
      functionName: "removeAdministrator",
      args: [address],
    });
    refetch();
  };

  const handleAddUser = async () => {
    if (newUserAddress.trim() && newUserAddress.startsWith("0x") && newUserAddress.length === 42) {
      const user: User = {
        address: newUserAddress as `0x${string}`,
      };
      setNewUserAddress("");
      setIsDialogOpen(false);
      
      await writeContractAsync({
        ...eco2ContractConfig,
        functionName: "addAdministrator",
        args: [user.address],
      });
      refetch();
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "address",
      header: "Address",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => handleRemoveUser(e, user.address)}
            >
              Remove
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
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
                  No hay usuarios pendientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Button
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="mt-2"
      >
        <Plus className="w-4 h-4" />
        Add staff member
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Administrador</DialogTitle>
            <DialogDescription>
              Ingresa la dirección Ethereum del nuevo administrador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="user-address" className="text-sm font-medium">
                Dirección (Address)
              </label>
              <Input
                id="user-address"
                type="text"
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                value={newUserAddress}
                onChange={(e) => setNewUserAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Debe ser una dirección válida de Ethereum (42 caracteres incluyendo 0x)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!newUserAddress.trim() || newUserAddress.length !== 42 || !newUserAddress.startsWith("0x")}
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
