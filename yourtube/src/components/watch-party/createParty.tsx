"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useUser } from "@/lib/authContext";
import axiosinstance from "@/lib/axiosinstance";
import { useRouter } from "next/navigation";

interface CreatePartyProps {
  videoId: string;
}
const CreateParty = ({ videoId }: CreatePartyProps) => {
  const router = useRouter();
  const { user }: any = useUser();
  const [partyId, setPartyId] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const create = async () => {
    try {
      if (!user) {
        alert("Please login first");
        return;
      }

      const response = await axiosinstance.post("/watch-party/create", {
        hostId: user._id,
        videoId,
      });
      const party = response.data.party;
      setPartyId(party.partyId);
      setInviteLink(`${window.location.origin}/watch-party/${party.partyId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create watch party");
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    alert("Invite Link Copied!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold"> Create Watch Party</h2>
      <Input value={videoId} readOnly />
      <Button className="w-full" onClick={create}>
        Create Party
      </Button>
      {partyId && (
        <div className="space-y-3 border rounded-lg p-4">
          <p className="font-medium text-muted-foreground">
            Party Create Successfully{" "}
          </p>
          <div>
            <label className="text-sm ">Party Id</label>
            <Input value={partyId} readOnly />
          </div>
          <div>
            <label className="text-sm ">Invite Link</label>
            <Input value={inviteLink} readOnly />
          </div>
          <Button variant="outline" onClick={copyLink} className="w-full">
            Copy Invite Link
          </Button>
          <Button
            className="w-full"
            onClick={() => router.push(`/watch-party/${partyId}`)}
          >
            Start Watch Party
          </Button>
        </div>
      )}
    </div>
  );
};
export default CreateParty;
