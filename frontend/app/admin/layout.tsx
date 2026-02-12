"use client";

import { eco2ContractConfig } from "@/contracts";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useReadContract, useWalletClient } from "wagmi";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: wallet, isLoading } = useWalletClient();
  const { data: isAdmin, isLoading: isAdminLoading } = useReadContract({
    ...eco2ContractConfig,
    functionName: "isAdmin",
    args: [wallet?.account.address || "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!wallet?.account.address },
  });
  const { data: owner } = useReadContract({
    ...eco2ContractConfig,
    functionName: "owner",
  });

  useEffect(() => {
    if (isLoading || isAdminLoading) return;
    console.log("isAdmin:", isAdmin);
    if (wallet?.account.address && isAdmin) {
      console.log("Admin wallet address:", wallet.account.address);
    } else {
      redirect("/");
    }
  }, [wallet, isLoading, isAdmin, isAdminLoading]);

  return isLoading || isAdminLoading ? (
    <div className="flex items-center justify-center w-full h-full">
      Loading...
    </div>
  ) : (
    <div className="flex h-full">
      <div className="px-4 py-6 bg-emerald-900 text-white">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <nav className="flex flex-col gap-4">
          <Link href="/admin/projects" className="hover:underline">
            Manage Projects
          </Link>
          <Link href="/admin/companies" className="hover:underline">
            Manage Companies
          </Link>
          {owner?.toLowerCase() === wallet?.account.address.toLowerCase() && (
            <Link href="/admin/users" className="hover:underline">
              Manage Users
            </Link>
          )}
        </nav>
      </div>
      <div className="flex justify-center py-2 w-full mt-6">{children}</div>
    </div>
  );
}
