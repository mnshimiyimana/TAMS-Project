"use client";
import React from "react";
import ResetPage from "../page";

interface TokenPageProps {
  params: {
    token: string;
  };
}

export default function ResetTokenPage({ params }: TokenPageProps): React.ReactElement {
  return <ResetPage />;
}