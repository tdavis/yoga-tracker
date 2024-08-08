import { API_URL } from "@/constants";
import { State, hookstate, useHookstate } from "@hookstate/core";
import { startOfToday } from "date-fns";
import { format } from "date-fns";

export interface Checkin {
  id: number;
  user: string;
  meditation: string;
  completed_at: Date;
  completed_today: number;
}

function parseCheckin(body: any): Checkin {
  return {
    ...body,
    completed_at: Date.parse(body.completed_at as string),
  };
}

export async function fetchCheckins(user: string, date: Date) {
  const formatted = format(date, "yyyy-MM-dd");
  const resourcePath = `${API_URL}/checkins/${user}/${formatted}`;
  const response = await fetch(resourcePath);
  const body = await response.json();
  return body.map((e: any) => parseCheckin(e));
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
  const response = await fetch(`${API_URL}/complete`, requestOptions);
  const checkin = parseCheckin(await response.json());

  state.set((v) => {
    const existing = v.findIndex((c) => c.meditation === checkin.meditation);
    if (existing > -1) {
      v.splice(existing, 1);
    }
    v.push(checkin);
    return v;
  });
}

const state = hookstate<Checkin[]>([]);

export function useCheckinsState(): State<Checkin[]> {
  return useHookstate(state);
}
