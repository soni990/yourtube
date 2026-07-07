"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import WatchPartyModal from "./watchPartyModal"

interface WatchPartyButtonProps{
    videoId :string
}

const WatchPartyButton=({videoId}:WatchPartyButtonProps)=>{
    const [open,setOpen]=useState(false)
    return (
        <>
        <Button onClick={()=> setOpen(true)}>Watch Party</Button>
        <WatchPartyModal open={open} onOpenChange={setOpen} videoId={videoId}></WatchPartyModal>
        </>
    )
}
export default WatchPartyButton