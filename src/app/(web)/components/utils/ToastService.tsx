"use client";

import { createContext, useCallback, useContext } from "react";
import { useToast } from "@once-ui-system/core";

export type ToastVariant = "success" | "danger";

export type ToastPayload = {
  message: string;
  title?: string;
  variant?: ToastVariant;
};

type ToastServiceContextValue = {
  notify: (payload: ToastPayload) => void;
};

const ToastServiceContext = createContext<ToastServiceContextValue | undefined>(undefined);

export function ToastServiceProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();

  const notify = useCallback(
    (payload: ToastPayload) => {
      const message = payload.title
        ? `${payload.title} — ${payload.message}`
        : payload.message;
      addToast({
        message,
        variant: payload.variant ?? "success",
      });
    },
    [addToast],
  );

  return <ToastServiceContext.Provider value={{ notify }}>{children}</ToastServiceContext.Provider>;
}

export function useToastService() {
  const context = useContext(ToastServiceContext);
  if (!context) {
    throw new Error("useToastService doit être utilisé avec ToastServiceProvider");
  }
  return context;
}
