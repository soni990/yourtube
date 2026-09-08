import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import axiosinstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/authContext";

const ChannelDialogue = ({ isopen, onclose, channeldata, mode }: any) => {
  const { user, login }: any = useUser();
  const router = useRouter();
  const [formdata, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (channeldata && mode === "edit") {
      setFormData({
        name: channeldata.name || "",
        description: channeldata.description || "",
      });
    } else {
      setFormData({
        name: user?.name || "",
        description: "",
      });
    }
  }, [channeldata, mode, user]);
  const handlechange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handlesubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      channelname: formdata.name,
      description: formdata.description,
    };
    if (!user) return;
    const response = await axiosinstance.patch(
      `/user/update/${user?._id}`,
      payload,
    );
    login(response?.data);
    router.push(`/channel/${user?._id}`);
    setFormData({
      name: "",
      description: "",
    });
    onclose();
  };

  return (
    <Dialog open={isopen} onOpenChange={onclose}>
  <DialogContent className="w-[calc(100%-2rem)] sm:max-w-125">
    <DialogHeader>
      <DialogTitle className="text-xl sm:text-2xl font-bold">
        {mode === "create" ? "Create your channel" : "Edit your channel"}
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={handlesubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Channel Name</Label>

        <Input
          id="name"
          name="name"
          value={formdata.name}
          onChange={handlechange}
          placeholder="Enter channel name"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Channel Description</Label>

        <Textarea
          id="description"
          name="description"
          value={formdata.description}
          onChange={handlechange}
          rows={4}
          placeholder="Tell viewers about your channel..."
          className="w-full resize-none"
        />
      </div>

      <DialogFooter className="mt-4 sm:mt-6 flex flex-row items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onclose}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create channel"
              : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
  );
};
export default ChannelDialogue;
function preventDefault() {
  throw new Error("Function not implemented.");
}
