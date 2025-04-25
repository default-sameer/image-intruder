import axios from "axios";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SOCKET_URL
    : process.env.NEXT_PUBLIC_SOCKET_URL_DEV;

const defaultOptions = {
  withCredentials: true,
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

const instance = axios.create(defaultOptions);

export default instance;
