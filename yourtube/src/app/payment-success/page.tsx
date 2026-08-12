"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";


export default function PaymentSuccess(){

const searchParams = useSearchParams();


const userId = searchParams.get("userId");
const plan = searchParams.get("plan");
const sessionId = searchParams.get("session_id");



useEffect(()=>{


const verifyPayment = async()=>{

try{

// 1. Verify payment

const res = await axios.post(
"http://localhost:5000/user/verify-payment",
{
sessionId
}
);




// 2. Upgrade plan

await axios.post(
"http://localhost:5000/user/upgrade-plan",
{
userId,
plan,
paymentId:res.data.paymentId,
orderId:sessionId
}
);

}
catch(error){

console.log(error);

}

};



if(sessionId){
verifyPayment();
}


},[]);



return(
<div>
<h1>
Payment Successful 🎉
</h1>

<p>
Your {plan} plan is activated
</p>

</div>
)


}