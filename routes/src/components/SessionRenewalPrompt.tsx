import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionRenewalPromptProps {
  onRenew: () => void;
  onLogout: () => void;
  showPrompt: boolean;
  remainingTime: number;
}

export const SessionRenewalPrompt: React.FC<SessionRenewalPromptProps> = ({
  onRenew,
  onLogout,
  showPrompt,
  remainingTime,
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    setTimeLeft(remainingTime);
  }, [remainingTime]);

  useEffect(() => {
    if (!showPrompt) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showPrompt, onLogout]);

  return (
    <Dialog open={showPrompt} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expiring</DialogTitle>
          <DialogDescription>
            Your session will expire in {timeLeft} seconds. Would you like to
            stay logged in?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button color="sky" onClick={onLogout}>
            Logout
          </Button>
          <Button color="teal" onClick={onRenew}>
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
