"use client";

import { useEffect, useState } from "react";
import NewCompanyForm from "./NewCompanyForm";
import CompleteCompanyForm from "./CompleteCompanyForm";
import { useConnectorClient, useReadContract } from "wagmi";
import { eco2ContractConfig } from "@/contracts";
import MessageConnectWallet from "../project/MessageConnectWallet";
import { Card, CardContent } from "../ui/card";

export default function RegisterCompany() {
  const { data: walletClient } = useConnectorClient();
  const [successRegister, setSuccessRegister] = useState(false);
  const { data, isLoading } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getCompany",
    args: [walletClient?.account.address || "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!walletClient?.account.address },
  });
  const { data: project, isLoading: projectLoading } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getProject",
    args: [walletClient?.account.address || "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!walletClient?.account.address },
  });

  const handleSuccess = () => {
    setSuccessRegister(true);
  };

  useEffect(() => {
    if (data && data.id) {
      setSuccessRegister(true);
      console.log("Company already registered:", data);
    }
  }, [data]);

  return isLoading || projectLoading ? (
    <div>Loading...</div>
  ) : walletClient ? (
    project ? <Card><CardContent>We detected a project associated with this wallet.</CardContent></Card> :
    <>
      {successRegister ? (
        <CompleteCompanyForm />
      ) : (
        <NewCompanyForm onSuccess={handleSuccess} />
      )}
    </>
  ) : (
    <MessageConnectWallet />
  );
}
