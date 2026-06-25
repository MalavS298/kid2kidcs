import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import wwLogo from "@/assets/ww-robotics-logo.png.asset.json";

type Props = { children: ReactNode };

const WestwoodJoinDialog = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [isWW, setIsWW] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    setOpen(false);
    navigate(isWW ? "/join/ww-robotics" : "/join");
    setIsWW(false);
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex">{children}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center overflow-hidden shrink-0">
                <img src={wwLogo.url} alt="Westwood Robotics" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <DialogTitle className="text-left">Quick question first</DialogTitle>
                <DialogDescription className="text-left">Just so we route you to the right place.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-4">
            <p className="text-sm font-medium mb-3">
              Are you by any chance joining the <span className="text-orange-600">Westwood Python Camp</span>?
            </p>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox checked={isWW} onCheckedChange={(v) => setIsWW(!!v)} className="mt-0.5" />
              <span className="text-sm text-muted-foreground">
                Yes — I'm signing up for the Westwood Robotics Python camp directly through this website (I did <span className="font-medium text-foreground">not</span> already sign up through the other form).
              </span>
            </label>
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleContinue} className={isWW ? "bg-orange-500 hover:bg-orange-600" : ""}>
              {isWW ? "Continue to Westwood signup" : "Continue to general signup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WestwoodJoinDialog;
