"use client"
import WatchPartyRoom from "@/components/watch-party/watchPartyRoom";
import { useParams } from "next/navigation";
const WatchPartyPage =()=>{
    const params=useParams<{ partyId: string }>()
    return(
        <WatchPartyRoom partyId={params.partyId}/>
    )
}
export default WatchPartyPage