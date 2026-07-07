import watchParty from "../Modals/watchParty.js";
export const createParty=async(req,res)=>{
    try{
        const{hostId,videoId}=req.body;
        const partyId=Math.random().toString(36).substring(2,10)
        const party=await watchParty.create({hostId,videoId,partyId,participants:[]})
        return res.status(201).json({success:true,party})
    }catch(error){
        return res.status(500).json({success:false ,message :error.message})
    }
}
export const joinParty=async(req,res)=>{
    try{
        const{partyId,userId,username}=req.body;
        console.log("request body ",req.body)
        const party=await watchParty.findOne({partyId})
        console.log("Party found", party)
        if(!party){
            return res.status(404).json({
                success:false,
                message:"Party not found"
            })
        }
        const alreadyJoined=party.participants.find((participants)=>participants.userId === userId)
        if(!alreadyJoined){
            party.participants.push({userId,username})
            await party.save()
        }
        return res.status(200).json({success:true,party, message:"Joined party successfully"})
    }catch(error){
        return res.status(500).json({success:false ,message :error.message})
    }
}
export const getParty = async (req, res) => {
  try {
    const { partyId } = req.params;

    const party = await watchParty.findOne({ partyId });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    return res.status(200).json({
      success: true,
      party,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};