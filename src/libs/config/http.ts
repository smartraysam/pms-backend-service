import axios from "axios";

const https = axios.create({
  baseURL: "/api",
});

export default https;

const PROVIDER_LIST_API = process.env.PROVIDER_LIST_API ?? "";
const PROVIDER_LIST_API_TOKEN = process.env.PROVIDER_LIST_API_TOKEN ?? "";

export const providerApi = axios.create({
  baseURL: PROVIDER_LIST_API,
  headers: {
    "api-token": PROVIDER_LIST_API_TOKEN,
  },
});
