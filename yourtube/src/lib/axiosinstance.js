import axios from "axios";
const axiosinstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL
})
export default axiosinstance;