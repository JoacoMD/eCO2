"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eco2ContractConfig } from "@/contracts";
import { Check, Clock, Cross } from "lucide-react";
import { redirect } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useReadContract, useWalletClient, useWriteContract } from "wagmi";
import { toast } from "sonner";

enum ProjectStatus {
  PENDING_APPROVAL,
  APPROVED,
  REJECTED,
}

const statusLabels: Record<ProjectStatus, React.ReactNode> = {
  [ProjectStatus.PENDING_APPROVAL]: (
    <>
      <Clock className="text-blue-600" /> Pending approval
    </>
  ),
  [ProjectStatus.APPROVED]: (
    <>
      <Check className="text-green-600" /> Approved
    </>
  ),
  [ProjectStatus.REJECTED]: (
    <>
      <Cross className="text-red-600" /> Rejected
    </>
  ),
};

import { BACKEND_URL } from "@/lib/config";

export default function CompanyDashboardPage() {
  const { data: wallet } = useWalletClient();
  const [balance, setBalance] = useState<number>(0);
  const [companyInfo, setCompanyInfo] = useState<{
    name: string;
    industry: string;
    website: string;
  } | null>(null);
  const { data: company, isLoading } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getCompany",
    args: [
      wallet?.account.address || "0x0000000000000000000000000000000000000000",
    ],
    query: { enabled: !!wallet?.account.address },
  });
  const { data: balanceData, isLoading: balanceLoading } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getBalanceOfAllTokens",
    args: [
      wallet?.account.address || "0x0000000000000000000000000000000000000000",
    ],
    query: { enabled: !!wallet?.account.address },
  });

  useEffect(() => {
    if (!company && !isLoading) {
      redirect("/");
    }
  }, [company]);

  useEffect(() => {
    if (company) {
      fetch(`${BACKEND_URL}/companies/${wallet?.account.address}`).then((response) => {
        if (response.ok) {
          response.json().then((companyDetails) => {
            setCompanyInfo({
              name: companyDetails.name,
              industry: companyDetails.industry,
              website: companyDetails.website,
            });
          });
        } else {
          console.error("Failed to fetch company details");
        }
      });
    }
  }, [company, wallet?.account.address]);

  useEffect(() => {
    if (balanceData) {
      const balancesArray = balanceData[1];
      const totalBalance = balancesArray.reduce(
        (acc: number, curr: bigint) => acc + Number(curr),
        0,
      );
      setBalance(totalBalance);
    }
  }, [balanceData]);

  const { writeContractAsync, isSuccess, error } = useWriteContract();

  const tokenBalances = useMemo(() => {
    if (!balanceData) {
      return [] as { tokenId: bigint; amount: bigint }[];
    }
    const tokenIds = balanceData[0] as bigint[];
    const balances = balanceData[1] as bigint[];
    return tokenIds
      .map((tokenId, index) => ({ tokenId, amount: balances[index] }))
      .filter((token) => token.amount > BigInt(0));
  }, [balanceData]);

  const [burnTokenId, setBurnTokenId] = useState<string>("");
  const [burnAmount, setBurnAmount] = useState<string>("1");
  const [burning, setBurning] = useState(false);

  useEffect(() => {
    if (!burnTokenId && tokenBalances.length > 0) {
      setBurnTokenId(tokenBalances[0].tokenId.toString());
    }
  }, [burnTokenId, tokenBalances]);

  const handleBurnTokens = async () => {
    if (!burnTokenId) {
      toast.error("Selecciona un token.");
      return;
    }

    const amountNumber = Number(burnAmount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      toast.error("Ingresa una cantidad válida.");
      return;
    }

    const tokenBalance = tokenBalances.find(
      (token) => token.tokenId.toString() === burnTokenId,
    );
    if (!tokenBalance || BigInt(amountNumber) > tokenBalance.amount) {
      toast.error("Cantidad mayor al saldo disponible.");
      return;
    }

    try {
      setBurning(true);
      await writeContractAsync({
        ...eco2ContractConfig,
        functionName: "burnProjectTokens",
        args: [BigInt(burnTokenId), BigInt(amountNumber)],
      });
      toast.success("Tokens quemados correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al quemar tokens.");
    } finally {
      setBurning(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="p-8 w-full sm:max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">
          Dashboard - {company?.name || "Nombre empresa"}
        </h1>
        <div className="flex items-center gap-2">
          <Card className="max-w-xs mt-6">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="flex items-center gap-2">
                {isLoading
                  ? "Loading..."
                  : statusLabels[
                      company
                        ? (company.status as ProjectStatus)
                        : ProjectStatus.PENDING_APPROVAL
                    ]}
              </p>
            </CardContent>
          </Card>
          {company && company.status === ProjectStatus.APPROVED && (
            <Card className="min-w-45 mt-6">
              <CardHeader>
                <CardTitle>Credits available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex gap-2 text-lg items-center">{balance}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          <Card className="w-full mt-6">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                {companyInfo?.industry}
              </p>
              <a href={companyInfo?.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                {companyInfo?.website}
              </a>
            </CardContent>
          </Card>

          {company && company.status === ProjectStatus.APPROVED && (
            <>
              <Card className="w-full mt-6">
                <CardHeader>
                  <CardTitle>Tokens disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  {balanceLoading ? (
                    <p className="text-sm text-zinc-500">Cargando tokens...</p>
                  ) : tokenBalances.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No tienes tokens disponibles.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tokenBalances.map((token) => (
                        <div
                          key={token.tokenId.toString()}
                          className="flex items-center justify-between rounded-md border border-zinc-200 p-4"
                        >
                          <div className="text-sm">
                            <p className="font-semibold">
                              Token #{token.tokenId.toString()}
                            </p>
                            <p className="text-zinc-600">
                              Cantidad: {token.amount.toString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="w-full mt-6">
                <CardHeader>
                  <CardTitle>Quemar tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-700">
                        Token
                      </label>
                      <select
                        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                        value={burnTokenId}
                        onChange={(event) => setBurnTokenId(event.target.value)}
                        disabled={tokenBalances.length === 0}
                      >
                        {tokenBalances.length === 0 ? (
                          <option value="">Sin tokens disponibles</option>
                        ) : (
                          tokenBalances.map((token) => (
                            <option
                              key={token.tokenId.toString()}
                              value={token.tokenId.toString()}
                            >
                              Token #{token.tokenId.toString()} - {token.amount.toString()}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-700">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={burnAmount}
                        onChange={(event) => setBurnAmount(event.target.value)}
                        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleBurnTokens}
                    disabled={burning || tokenBalances.length === 0}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {burning ? "Quemando..." : "Quemar tokens"}
                  </button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
