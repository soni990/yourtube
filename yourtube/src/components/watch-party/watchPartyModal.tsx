"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import JoinParty from "./joinParty";
import CreateParty from "./createParty";
interface Props{
    open:boolean;
    onOpenChange:(open:boolean)=> void;
    videoId:string;
}

const watchPartyModal=({
    open,onOpenChange,videoId
}:Props)=>{
    const [screen ,setScreen]=useState<"home"|"create"|"join">("home")
    useEffect(()=>{
        if(!open){
            setScreen("home")
        }
    },[open])
    return (
       <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-lg">
    {screen === "home" && (
      <>
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Watch Party
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Watch videos together with your friends in real-time.
        </p>

        <div className="space-y-3 mt-4 sm:mt-5">
          <Button
            className="w-full"
            onClick={() => setScreen("create")}
          >
            Create Party
          </Button>

          <Button
            className="w-full"
            variant="ghost"
            onClick={() => setScreen("join")}
          >
            Join Party
          </Button>
        </div>
      </>
    )}

    {screen === "create" && (
      <CreateParty videoId={videoId} />
    )}

    {screen === "join" && (
      <JoinParty />
    )}
  </DialogContent>
</Dialog>
    )
}
export default watchPartyModal