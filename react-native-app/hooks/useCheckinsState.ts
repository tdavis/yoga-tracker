import { API_URL } from "@/constants";
import {
  InferStateExtensionType,
  State,
  extend,
  hookstate,
  useHookstate,
} from "@hookstate/core";
import { Identifiable, identifiable } from "@hookstate/identifiable";
import { Subscribable, subscribable } from "@hookstate/subscribable";
import { format, startOfToday } from "date-fns";
import { subSeconds } from "date-fns";

function extensions<S, E>(key: string) {
  return extend<S, E, Identifiable, Subscribable>(
    identifiable(key),
    subscribable(),
  );
}

export interface Checkin {
  id: number;
  user: string;
  meditation: string;
  completedAt: Date;
  completedToday: number;
  canComplete: boolean;
}

function parseCheckin(body: any): Checkin {
  return {
    ...body,
    canComplete: false,
    completedAt: Date.parse(body.completed_at as string),
    completedToday: body.completed_today,
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
  const date = subSeconds(new Date(), 30);
  const timestamp = date.toISOString();
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name: user, meditation, timestamp }),
  };
  const response = await fetch(`${API_URL}/complete`, requestOptions);
  const checkin = parseCheckin(await response.json());

  state.set((v) => {
    const checkins = v.filter((c) => c.meditation !== checkin.meditation);
    checkins.push(checkin);
    return checkins;
  });
}

type Extended = InferStateExtensionType<typeof extensions>;

const state = hookstate<Checkin[], Extended>([], extensions("checkins"));

export function useCheckinsState(): State<Checkin[], Extended> {
  return useHookstate(state);
}
