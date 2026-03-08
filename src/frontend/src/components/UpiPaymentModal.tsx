import type { UserProfile } from "@/backend.d";
import { OrderStatus } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { Check, Copy, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface UpiPaymentModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  price: string;
  currentUser: UserProfile | null;
  onSuccess: () => void;
  onLoginRequired: () => void;
}

export default function UpiPaymentModal({
  open,
  onClose,
  itemName,
  price,
  currentUser,
  onSuccess,
  onLoginRequired,
}: UpiPaymentModalProps) {
  const { actor } = useActor();
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [screenshotError, setScreenshotError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const UPI_ID = "6206470120@fam";

  function handleCopyUpi() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setScreenshotError("Please upload an image file.");
      return;
    }
    setScreenshotFile(file);
    setScreenshotError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function removeScreenshot() {
    setScreenshotFile(null);
    setScreenshotPreview("");
    setScreenshotError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePaid() {
    setErrorMsg("");
    setUsernameError("");
    setScreenshotError("");

    if (!currentUser) {
      onLoginRequired();
      return;
    }

    let hasError = false;

    if (!minecraftUsername.trim()) {
      setUsernameError("Please enter your Minecraft username.");
      hasError = true;
    }

    if (!screenshotFile) {
      setScreenshotError("Please upload your payment screenshot.");
      hasError = true;
    }

    if (hasError) return;

    if (!actor) {
      setErrorMsg("Connection not ready. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert screenshot to base64
      const base64DataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(screenshotFile!);
      });

      await actor.submitOrder({
        username: currentUser.username,
        minecraftUsername: minecraftUsername.trim(),
        itemName,
        price,
        screenshotUrl: base64DataUrl,
        timestamp: BigInt(Date.now()),
        status: OrderStatus.pending,
      });

      setSuccessMsg(
        "Payment submitted! Your rank/coins will be credited within 24 hours.",
      );
      setTimeout(() => {
        setSuccessMsg("");
        onSuccess();
        onClose();
      }, 2500);
    } catch {
      setErrorMsg("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    setMinecraftUsername("");
    setScreenshotFile(null);
    setScreenshotPreview("");
    setScreenshotError("");
    setUsernameError("");
    setErrorMsg("");
    setSuccessMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="upi.modal"
        className="max-w-md p-0 overflow-hidden border-0 max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.1 0.03 145)",
          border: "2px solid oklch(0.65 0.18 72)",
          boxShadow:
            "0 0 40px oklch(0.78 0.18 72 / 0.4), 0 0 80px oklch(0.78 0.18 72 / 0.15)",
        }}
      >
        {/* Gold top bar */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.18 72), transparent)",
          }}
        />

        <div className="px-6 py-5">
          <DialogHeader className="mb-4">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle
                className="font-pixel text-sm leading-loose"
                style={{ color: "oklch(0.88 0.18 72)" }}
              >
                🪙 PAYMENT
              </DialogTitle>
              <button
                type="button"
                data-ocid="upi.close_button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-[oklch(0.5_0.03_145)] hover:text-[oklch(0.78_0.18_72)] transition-colors mt-0.5"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </DialogHeader>

          {/* Item & price */}
          <div
            className="rounded-sm p-3 mb-4 text-center"
            style={{
              background: "oklch(0.13 0.04 72 / 0.6)",
              border: "1px solid oklch(0.42 0.12 72 / 0.5)",
            }}
          >
            <p
              className="font-pixel text-xs leading-loose"
              style={{ color: "oklch(0.78 0.18 72)" }}
            >
              {itemName}
            </p>
            <p
              className="font-pixel text-2xl mt-1"
              style={{ color: "oklch(0.92 0.2 72)" }}
            >
              {price}
            </p>
          </div>

          {/* QR code image */}
          <div
            className="mb-4 rounded-sm overflow-hidden mx-auto"
            style={{
              width: 180,
              height: 180,
              border: "2px solid oklch(0.55 0.15 72 / 0.6)",
              boxShadow: "0 0 12px oklch(0.78 0.18 72 / 0.25)",
              position: "relative",
            }}
          >
            <img
              src="/assets/uploads/Picsart_26-03-05_10-18-43-798-1.png"
              alt="UPI QR Code"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                objectPosition: "top",
                display: "block",
                imageRendering: "auto",
              }}
            />
          </div>

          {/* UPI ID */}
          <div className="mb-4">
            <p
              className="text-[oklch(0.5_0.05_145)] text-xs font-pixel mb-2 text-center"
              style={{ letterSpacing: "0.1em" }}
            >
              UPI ID
            </p>
            <div
              className="flex items-center gap-2 rounded-sm px-3 py-2"
              style={{
                background: "oklch(0.08 0.02 145)",
                border: "1px solid oklch(0.55 0.18 72 / 0.6)",
              }}
            >
              <span
                className="flex-1 font-pixel text-xs text-center select-all"
                style={{ color: "oklch(0.88 0.2 72)", letterSpacing: "0.05em" }}
              >
                {UPI_ID}
              </span>
              <button
                type="button"
                data-ocid="upi.copy_button"
                onClick={handleCopyUpi}
                className="flex-shrink-0 transition-colors"
                style={{
                  color: copied
                    ? "oklch(0.72 0.22 142)"
                    : "oklch(0.55 0.1 145)",
                }}
                title="Copy UPI ID"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check size={14} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Copy size={14} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs mt-1"
                style={{ color: "oklch(0.72 0.22 142)" }}
              >
                Copied!
              </motion.p>
            )}
          </div>

          {/* Instruction */}
          <p
            className="text-center text-xs mb-4 leading-relaxed"
            style={{ color: "oklch(0.55 0.05 145)" }}
          >
            Pay the exact amount, then fill in your details below
          </p>

          {/* Minecraft Username */}
          <div className="mb-4">
            <label
              htmlFor="upi-minecraft-username"
              className="block font-pixel text-[10px] mb-2"
              style={{ color: "oklch(0.72 0.18 142)", letterSpacing: "0.08em" }}
            >
              ⛏ MINECRAFT USERNAME
            </label>
            <Input
              id="upi-minecraft-username"
              data-ocid="upi.minecraft_input"
              placeholder="Enter your Minecraft username"
              value={minecraftUsername}
              onChange={(e) => {
                setMinecraftUsername(e.target.value);
                if (usernameError) setUsernameError("");
              }}
              disabled={isSubmitting || !!successMsg}
              className="font-sans text-sm rounded-sm"
              style={{
                background: "oklch(0.08 0.02 145)",
                border: usernameError
                  ? "1px solid oklch(0.55 0.22 25)"
                  : "1px solid oklch(0.35 0.05 145)",
                color: "oklch(0.88 0.02 145)",
              }}
            />
            {usernameError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-1"
                style={{ color: "oklch(0.65 0.22 25)" }}
              >
                ⚠ {usernameError}
              </motion.p>
            )}
          </div>

          {/* Screenshot Upload */}
          <div className="mb-4">
            <label
              htmlFor="upi-screenshot-input"
              className="block font-pixel text-[10px] mb-2"
              style={{ color: "oklch(0.72 0.18 142)", letterSpacing: "0.08em" }}
            >
              📸 PAYMENT SCREENSHOT
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              id="upi-screenshot-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isSubmitting || !!successMsg}
            />

            {screenshotPreview ? (
              /* Preview state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-sm overflow-hidden"
                style={{
                  border: "1px solid oklch(0.45 0.18 142 / 0.6)",
                  background: "oklch(0.08 0.02 145)",
                }}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Thumbnail */}
                  <div
                    className="flex-shrink-0 rounded-sm overflow-hidden"
                    style={{
                      width: 48,
                      height: 48,
                      border: "1px solid oklch(0.35 0.1 145)",
                    }}
                  >
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-pixel text-[9px] leading-loose truncate"
                      style={{ color: "oklch(0.78 0.2 142)" }}
                    >
                      ✓ SCREENSHOT UPLOADED
                    </p>
                    <p
                      className="text-xs font-sans truncate"
                      style={{ color: "oklch(0.5 0.05 145)" }}
                    >
                      {screenshotFile?.name}
                    </p>
                  </div>

                  {/* Remove button */}
                  {!isSubmitting && !successMsg && (
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="flex-shrink-0 transition-colors p-1"
                      style={{ color: "oklch(0.55 0.12 25)" }}
                      title="Remove screenshot"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Change button */}
                {!isSubmitting && !successMsg && (
                  <button
                    type="button"
                    data-ocid="upi.upload_button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full font-pixel text-[9px] py-2 transition-colors"
                    style={{
                      borderTop: "1px solid oklch(0.25 0.04 145)",
                      color: "oklch(0.55 0.1 145)",
                      background: "oklch(0.1 0.02 145)",
                    }}
                  >
                    CHANGE SCREENSHOT
                  </button>
                )}
              </motion.div>
            ) : (
              /* Dropzone state */
              <div
                data-ocid="upi.dropzone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="rounded-sm transition-all"
                style={{
                  background: isDragging
                    ? "oklch(0.14 0.06 142 / 0.4)"
                    : "oklch(0.08 0.02 145)",
                  border: isDragging
                    ? "2px dashed oklch(0.55 0.2 142)"
                    : screenshotError
                      ? "2px dashed oklch(0.45 0.18 25)"
                      : "2px dashed oklch(0.3 0.06 145)",
                  boxShadow: isDragging
                    ? "0 0 16px oklch(0.55 0.2 142 / 0.2)"
                    : "none",
                }}
              >
                <button
                  type="button"
                  data-ocid="upi.upload_button"
                  disabled={isSubmitting || !!successMsg}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <div
                      className="rounded-sm p-2"
                      style={{
                        background: isDragging
                          ? "oklch(0.2 0.1 142 / 0.5)"
                          : "oklch(0.14 0.04 145)",
                      }}
                    >
                      {isDragging ? (
                        <ImageIcon
                          size={20}
                          style={{ color: "oklch(0.72 0.22 142)" }}
                        />
                      ) : (
                        <Upload
                          size={20}
                          style={{ color: "oklch(0.45 0.08 145)" }}
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className="font-pixel text-[10px] transition-colors"
                        style={{
                          color: isDragging
                            ? "oklch(0.72 0.22 142)"
                            : "oklch(0.65 0.15 72)",
                        }}
                      >
                        {isDragging ? "DROP HERE" : "CLICK TO UPLOAD"}
                      </p>
                      <p
                        className="text-xs font-sans mt-1"
                        style={{ color: "oklch(0.4 0.04 145)" }}
                      >
                        or drag & drop your screenshot
                      </p>
                      <p
                        className="text-[10px] font-sans mt-0.5"
                        style={{ color: "oklch(0.35 0.03 145)" }}
                      >
                        PNG, JPG, WEBP accepted
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {screenshotError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-1"
                style={{ color: "oklch(0.65 0.22 25)" }}
              >
                ⚠ {screenshotError}
              </motion.p>
            )}
          </div>

          {/* Error message */}
          {errorMsg && (
            <motion.p
              data-ocid="upi.error_state"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-center mb-3"
              style={{ color: "oklch(0.65 0.22 25)" }}
            >
              ⚠ {errorMsg}
            </motion.p>
          )}

          {/* Success message */}
          {successMsg && (
            <motion.div
              data-ocid="upi.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-sm p-3 mb-3 text-center"
              style={{
                background: "oklch(0.12 0.05 142 / 0.5)",
                border: "1px solid oklch(0.55 0.2 142 / 0.5)",
              }}
            >
              <p className="text-xs" style={{ color: "oklch(0.72 0.22 142)" }}>
                ✓ {successMsg}
              </p>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              data-ocid="upi.pay_button"
              onClick={handlePaid}
              disabled={isSubmitting || !!successMsg}
              className="flex-1 mc-btn py-3 font-pixel text-xs tracking-wide rounded-sm"
              style={{
                background: "oklch(0.65 0.18 72)",
                border: "2px solid oklch(0.78 0.2 72)",
                color: "oklch(0.1 0.03 72)",
                boxShadow: "0 0 12px oklch(0.78 0.18 72 / 0.4)",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>SENDING...</span>
                </span>
              ) : (
                "✓ I HAVE PAID"
              )}
            </Button>
          </div>
        </div>

        {/* Gold bottom bar */}
        <div
          className="h-0.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.65 0.15 72 / 0.5), transparent)",
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
