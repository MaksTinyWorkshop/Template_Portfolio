"use client";

import { Button, Card, Flex, IconButton, Text } from "@once-ui-system/core";
import { useEffect, useId, useRef } from "react";
import styles from "./ConfirmModal.module.scss";

type ConfirmVariant = "primary" | "danger";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ConfirmVariant;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmVariant = "primary",
  busy = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const titleId = useId();
  const messageId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (!busy) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onClose]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => confirmButtonRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (busy) return;
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <dialog
        open
        className={styles.dialog}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        onCancel={(event) => {
          event.preventDefault();
          if (!busy) onClose();
        }}
      >
        <Card
          padding="20"
          border="neutral-medium"
          background="neutral-weak"
          className={styles.modalCard}
          data-variant={confirmVariant}
        >
          <Flex direction="column" gap="16" fillWidth>
            <Flex horizontal="between" vertical="center" gap="12" fillWidth>
              <Text as="h2" id={titleId} variant="heading-strong-m" onBackground="neutral-weak">
                {title}
              </Text>
              <IconButton
                className={styles.closeButton}
                icon="close"
                variant="ghost"
                aria-label="Fermer"
                onClick={onClose}
                disabled={busy}
              />
            </Flex>

            {message ? (
              <Text
                as="p"
                id={messageId}
                variant="body-default-m"
                onBackground="neutral-weak"
                style={{ lineHeight: 1.5 }}
              >
                {message}
              </Text>
            ) : null}

            <Flex horizontal="end" gap="8" wrap>
              <Button variant="secondary" size="m" onClick={onClose} disabled={busy}>
                {cancelLabel}
              </Button>
              <Button
                ref={confirmButtonRef}
                variant={confirmVariant}
                size="m"
                onClick={onConfirm}
                disabled={busy}
                loading={busy}
              >
                {confirmLabel}
              </Button>
            </Flex>
          </Flex>
        </Card>
      </dialog>
    </div>
  );
}
