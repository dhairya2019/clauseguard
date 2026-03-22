"use client";

import { useState } from "react";
import Script from "next/script";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fingerprint: string | null;
  onPaymentSuccess: () => void;
}

export function UpgradeModal({
  open,
  onOpenChange,
  fingerprint,
  onPaymentSuccess,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on server
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (fingerprint) {
        headers["X-Fingerprint"] = fingerprint;
      }

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error("Failed to create payment order");
      }

      const { orderId, amount, currency, keyId } = await res.json();

      // 2. Check if Razorpay script is loaded
      if (typeof window === "undefined" || !window.Razorpay) {
        setError(
          "Payment gateway is loading. Please try again in a moment.",
        );
        setLoading(false);
        return;
      }

      // 3. Open Razorpay checkout
      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency,
        name: "ClauseGuard",
        description: "Unlimited Contract Analysis",
        order_id: orderId,
        handler: async (response) => {
          // 4. Verify payment on server
          try {
            const verifyHeaders: Record<string, string> = {
              "Content-Type": "application/json",
            };
            if (fingerprint) {
              verifyHeaders["X-Fingerprint"] = fingerprint;
            }

            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: verifyHeaders,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const result = await verifyRes.json();
            if (result.success) {
              onPaymentSuccess();
              onOpenChange(false);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch {
            setError("Payment verification failed. Please try again.");
          }
        },
        theme: { color: "#1e40af" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Unlimited</DialogTitle>
            <DialogDescription>
              You have used all 3 free contract analyses. Upgrade for unlimited
              access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold">INR 299</div>
              <div className="text-sm text-muted-foreground">
                One-time payment
              </div>
              <ul className="mt-3 space-y-1 text-sm text-left">
                <li>Unlimited contract analyses</li>
                <li>All payment modes (UPI, cards, net banking)</li>
                <li>Instant access after payment</li>
              </ul>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button
              onClick={handlePayment}
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay with Razorpay"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
