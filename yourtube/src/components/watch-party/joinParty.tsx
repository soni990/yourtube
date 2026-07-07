"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axiosinstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/authContext";
import { useRouter } from "next/navigation";
const JoinParty = () => {
  const router=useRouter()
  const { user }: any = useUser();
  const [partyId, setPartyId] = useState("");
  const join = async () => {
    const actualPartyId = partyId.split("/").pop();
    try {
      const response = await axiosinstance.post("/watch-party/join", {
        partyId: actualPartyId,
        userId: user._id,
        username: user.name,
      });
      router.push(`/watch-party/${actualPartyId}`)
    } catch (error: any) {
      console.log(error);
      alert("Failed to join party");
    }
  };
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold"> JOIN Watch party</h2>
      <Input
        placeholder="Enter Party ID"
        value={partyId}
        onChange={(e) => setPartyId(e.target.value)}
      />
      <Button className="w-full " onClick={join}>
        Join Party{" "}
      </Button>
    </div>
  );
};
export default JoinParty;
