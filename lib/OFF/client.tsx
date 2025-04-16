import axios from "axios";
import { CreateOFFHeader, PROD_OFF_API_URL } from "./OFFcredentials";

const offClient = axios.create({
    baseURL: PROD_OFF_API_URL,
    headers: CreateOFFHeader()

})
//just need a user-agent header for now
export default offClient;