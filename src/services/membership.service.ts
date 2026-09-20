import { api } from "@/lib/api";

export async function getMyMembership() {
  const response = await api.get("/membership/me");
  return response.data;
}

export async function applyForMembership() {
  const response = await api.post("/membership/apply");
  return response.data;
}