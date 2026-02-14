"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eco2ContractConfig } from "@/contracts";
import { Check, Clock, Cross } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  BaseError,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import MilestonesSection, {
  Milestone,
} from "@/components/project/MilestonesSection";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatEther, parseEther, parseEventLogs } from "viem";
import Image from "next/image";

enum ProjectStatus {
  PENDING_APPROVAL,
  APPROVED,
  REJECTED,
}

type Listing = {
  seller: `0x${string}`;
  tokenId: bigint;
  amount: bigint;
  pricePerToken: bigint;
  active: boolean;
};

type ListingWithId = Listing & { listingId: bigint };

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
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProjectDashboardPage() {
  const { data: wallet, isLoading: walletLoading } = useWalletClient();
  const { data: project, isLoading: projectLoading } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getProject",
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

  const [projectInfo, setProjectInfo] = useState<{
    name: string;
    description: string;
    image: string;
  } | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [listingTokenId, setListingTokenId] = useState<string>("");
  const [listingAmount, setListingAmount] = useState<string>("1");
  const [listingPrice, setListingPrice] = useState<string>("0.01");
  const [listingSubmitting, setListingSubmitting] = useState(false);
  const [addMilestoneHash, setAddMilestoneHash] = useState<`0x${string}` | undefined>();

  const projectAddress =
    wallet?.account.address || "0x0000000000000000000000000000000000000000";

  const {
    data: listingsData,
    isLoading: listingsLoading,
    refetch: refetchListings,
  } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getListings",
    query: { enabled: !!wallet?.account.address },
  });

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [pendingMilestone, setPendingMilestone] = useState<Milestone | null>(null);

  const { authFetch } = useAuth();
  const { writeContractAsync, isSuccess, error } = useWriteContract();
  const { data: simulateData } = useSimulateContract({
    ...eco2ContractConfig,
    functionName: "addMilestone",
    account: wallet?.account.address,
  });

  const { data: milestoneReceipt, isSuccess: isMilestoneSuccess } = useWaitForTransactionReceipt({
    hash: addMilestoneHash,
  });

  const handleAddMilestone = async (milestone: Milestone) => {
    if (simulateData?.request) {
      try {
        setPendingMilestone(milestone);
        const hash = await writeContractAsync(simulateData.request);
        setAddMilestoneHash(hash);
        toast.info("Milestone transaction submitted. Waiting for confirmation...");
      } catch (error) {
        console.error("Error creating milestone transaction:", error);
        toast.error("Error creating milestone transaction");
        setPendingMilestone(null);
      }
    }
  };

  // Process milestone after transaction confirmation
  useEffect(() => {
    if (isMilestoneSuccess && milestoneReceipt && pendingMilestone) {
      try {
        // Parse event logs to get the milestone ID
        const logs = parseEventLogs({
          abi: eco2ContractConfig.abi,
          logs: milestoneReceipt.logs,
          eventName: 'MilestoneAdded',
        });

        if (logs.length > 0) {
          const milestoneId = logs[0].args.milestone;
          console.log("Milestone ID from event:", milestoneId);

          // Call backend to save milestone details (upsert: create if not exists, update if exists)
          // The backend event listener may have already created the milestone with just id and projectId
          // This POST request will either:
          // 1. Create the milestone if event listener hasn't processed it yet
          // 2. Update the existing milestone with title and url if it was already created
          // This prevents conflicts and ensures the milestone is always properly saved
          authFetch(`${BACKEND_URL}/projects/${projectAddress}/milestones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: Number(milestoneId),
              title: pendingMilestone.title,
              url: pendingMilestone.url,
            }),
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error("Backend failed to save milestone");
              }
              const data = await response.json();
              console.log("Milestone saved in backend:", data);
              toast.success(`Milestone added successfully! ID: ${milestoneId}`);
              setMilestones((prevMilestones) => [...prevMilestones, pendingMilestone]);
            })
            .catch((err) => {
              console.error("Error saving milestone to backend:", err);
              toast.error("Milestone created on blockchain but failed to save details in backend");
            })
            .finally(() => {
              setPendingMilestone(null);
              setAddMilestoneHash(undefined);
            });
        } else {
          toast.error("Failed to get milestone ID from transaction");
          setPendingMilestone(null);
          setAddMilestoneHash(undefined);
        }
      } catch (error) {
        console.error("Error processing milestone transaction:", error);
        toast.error("Error processing milestone");
        setPendingMilestone(null);
        setAddMilestoneHash(undefined);
      }
    }
  }, [isMilestoneSuccess, milestoneReceipt, pendingMilestone, authFetch, projectAddress]);

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

  useEffect(() => {
    if (project) {
      fetch(`${BACKEND_URL}/projects/${projectAddress}`).then((response) => {
        if (response.ok) {
          response.json().then((projectDetails) => {
            console.log("Project details response:", projectDetails);
            setProjectInfo({
              name: projectDetails.name,
              description: projectDetails.description,
              image: projectDetails.image,
            });
          });
        } else {
          console.error("Failed to fetch project details");
        }
      });
    }
  }, [project, projectAddress]);

  const activeListings = useMemo(() => {
    const raw = (listingsData ?? []) as Listing[];
    return raw
      .map((listing, index) => ({ ...listing, listingId: BigInt(index) }))
      .filter(
        (listing) =>
          listing.active &&
          listing.seller.toLowerCase() === projectAddress.toLowerCase(),
      ) as ListingWithId[];
  }, [listingsData, projectAddress]);

  const availableTokens = useMemo(() => {
    if (!balanceData) {
      return [] as { tokenId: bigint; amount: bigint }[];
    }
    const tokenIds = balanceData[0] as bigint[];
    const balances = balanceData[1] as bigint[];

    const activeByToken = new Map<string, bigint>();
    for (const listing of activeListings) {
      const key = listing.tokenId.toString();
      const current = activeByToken.get(key) ?? BigInt(0);
      activeByToken.set(key, current + listing.amount);
    }

    return tokenIds
      .map((tokenId, index) => {
        const balance = balances[index] ?? BigInt(0);
        const activeAmount = activeByToken.get(tokenId.toString()) ?? BigInt(0);
        const remaining = balance - activeAmount;
        return { tokenId, amount: remaining };
      })
      .filter((token) => token.amount > BigInt(0));
  }, [balanceData, activeListings]);

  useEffect(() => {
    if (availableTokens.length === 0) {
      if (listingTokenId) {
        setListingTokenId("");
      }
      return;
    }

    const isStillAvailable = availableTokens.some(
      (token) => token.tokenId.toString() === listingTokenId,
    );
    if (!listingTokenId || !isStillAvailable) {
      setListingTokenId(availableTokens[0].tokenId.toString());
    }
  }, [availableTokens, listingTokenId]);

  const handleCreateListing = async () => {
    if (!listingTokenId) {
      toast.error("Selecciona un token para listar.");
      return;
    }

    const amountNumber = Number(listingAmount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      toast.error("Ingresa una cantidad válida.");
      return;
    }

    const tokenBalance = availableTokens.find(
      (token) => token.tokenId.toString() === listingTokenId,
    );
    if (!tokenBalance || BigInt(amountNumber) > tokenBalance.amount) {
      toast.error("Cantidad mayor a lo disponible para venta.");
      return;
    }

    let pricePerToken: bigint;
    try {
      pricePerToken = parseEther(listingPrice || "0");
    } catch (err) {
      toast.error("Precio inválido.");
      return;
    }
    if (pricePerToken <= BigInt(0)) {
      toast.error("El precio debe ser mayor que 0.");
      return;
    }

    try {
      setListingSubmitting(true);
      await writeContractAsync({
        ...eco2ContractConfig,
        functionName: "listTokensForSale",
        args: [BigInt(listingTokenId), BigInt(amountNumber), pricePerToken],
      });
      await refetchListings();
      toast.success("Listing creado correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al crear el listing.");
    } finally {
      setListingSubmitting(false);
    }
  };

  const handleCancelListing = async (listingId: bigint) => {
    try {
      await writeContractAsync({
        ...eco2ContractConfig,
        functionName: "cancelListing",
        args: [listingId],
      });
      await refetchListings();
      toast.success("Listing cancelado.");
    } catch (err) {
      console.error(err);
      toast.error("Error al cancelar el listing.");
    }
  };

  useEffect(() => {
    console.log("Project data:", project, projectLoading, walletLoading);
    if (project) {
      setMilestones(
        project.milestones.map((m, i) => ({
          id: Number(m),
          title: `Milestone ${i + 1}`,
          completed: i < project.completedMilestones,
        })),
      );
    } else if (!projectLoading && !walletLoading) {
      redirect("/");
    }
  }, [project, projectLoading, walletLoading]);

  useEffect(() => {
    if (error) {
      console.error("Error adding milestone:", error);
      toast.error((error as BaseError).shortMessage);
    }
  }, [isSuccess, error]);

  return (
    <div className="flex justify-center">
      <div className="p-8 w-full sm:max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">
          Dashboard - {project?.name || "Nombre proyecto"}
        </h1>
        <div className="flex items-center gap-2">
          <Card className="max-w-xs mt-6">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="flex items-center gap-2">
                {projectLoading || walletLoading
                  ? "Loading..."
                  : statusLabels[
                      project
                        ? (project.status as ProjectStatus)
                        : ProjectStatus.PENDING_APPROVAL
                    ]}
              </p>
            </CardContent>
          </Card>
          {project && project.status === ProjectStatus.APPROVED && (
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
          {project && (
            <>
              {projectInfo && (
                <Card className="w-full mt-6">
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Image
                      src={projectInfo.image || ""}
                      alt={projectInfo.name || "Project Image"}
                      width={400}
                      height={300}
                    />
                    <p className="mb-4">{projectInfo.description || ""}</p>
                  </CardContent>
                </Card>
              )}
              {project.status === ProjectStatus.APPROVED && <>
              <MilestonesSection
                milestones={milestones}
                onAddMilestone={handleAddMilestone}
                onRemoveMilestone={(id) =>
                  setMilestones(milestones.filter((m) => m.id !== id))
                }
              />
              <Card className="w-full mt-6">
                <CardHeader>
                  <CardTitle>Crear listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-700">
                        Token
                      </label>
                      <select
                        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                        value={listingTokenId}
                        onChange={(event) =>
                          setListingTokenId(event.target.value)
                        }
                        disabled={availableTokens.length === 0}
                      >
                        {availableTokens.length === 0 ? (
                          <option value="">Sin tokens disponibles</option>
                        ) : (
                          availableTokens.map((token) => (
                            <option
                              key={token.tokenId.toString()}
                              value={token.tokenId.toString()}
                            >
                              Token #{token.tokenId.toString()} - Disponible{" "}
                              {token.amount.toString()}
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
                        value={listingAmount}
                        onChange={(event) =>
                          setListingAmount(event.target.value)
                        }
                        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-700">
                        Precio por token (ETH)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.0001"
                        value={listingPrice}
                        onChange={(event) =>
                          setListingPrice(event.target.value)
                        }
                        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateListing}
                    disabled={listingSubmitting || availableTokens.length === 0}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {listingSubmitting ? "Creando..." : "Crear listing"}
                  </button>
                </CardContent>
              </Card>

              <Card className="w-full mt-6">
                <CardHeader>
                  <CardTitle>Listings activos</CardTitle>
                </CardHeader>
                <CardContent>
                  {listingsLoading ? (
                    <p className="text-sm text-zinc-500">
                      Cargando listings...
                    </p>
                  ) : activeListings.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No tienes listings activos.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeListings.map((listing) => (
                        <div
                          key={listing.listingId.toString()}
                          className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="text-sm">
                            <p className="font-semibold">
                              Token #{listing.tokenId.toString()}
                            </p>
                            <p className="text-zinc-600">
                              Cantidad: {listing.amount.toString()}
                            </p>
                            <p className="text-zinc-600">
                              Precio: {formatEther(listing.pricePerToken)} ETH
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelListing(listing.listingId)
                            }
                            className="inline-flex items-center justify-center rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="w-full mt-6">
                <CardHeader>
                  <CardTitle>Completar información de tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-600">
                    Añade nombre, descripción e imagen a los tokens recién
                    creados.
                  </p>
                  <Link
                    href="/project/tokens/new"
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Completar tokens
                  </Link>
                </CardContent>
              </Card>
              </>
              }
            </>
          )}
        </div>
      </div>
    </div>
  );
}
