import { State, hookstate, useHookstate } from "@hookstate/core";
import { Platform } from "react-native";
import { startOfToday } from "date-fns";
import { format } from "date-fns";

export const localhost =
  Platform.OS === "web" ? "localhost:8080" : "10.0.2.2:8080";

export interface Checkin {
  id: number;
  user: string;
  meditation: string;
  completed_at: Date;
  completed_today: number;
}

export async function fetchCheckins(user: string, date: Date) {
  const formatted = format(date, "yyyy-MM-dd");
  const resourcePath = `http://${localhost}/checkins/${user}/${formatted}`;
  const response = await fetch(resourcePath);
  const body = await response.json();
  return body.map((i: any) => ({
    ...i,
    completed_at: Date.parse(i.completed_at as string),
  }));
}

export async function reloadTodaysCheckins(user: string) {
  const checkins = await fetchCheckins(user, startOfToday());
  state.set(checkins);
}

export async function markComplete(user: string, meditation: string) {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name: user, meditation }),
  };
  return fetch(`http://${localhost}/complete`, requestOptions);
}

const state = hookstate<Checkin[]>([]);

export function useCheckinsState(): State<Checkin[]> {
  return useHookstate(state);
}
