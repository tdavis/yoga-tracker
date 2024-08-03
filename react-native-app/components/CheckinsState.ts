import { State, hookstate, useHookstate } from "@hookstate/core";
import { Platform } from "react-native";

const localhost = Platform.OS === "web" ? "localhost:8080" : "10.0.2.2:8080";

export interface Checkin {
  id: number;
  user: string;
  meditation: string;
  completed_at: Date;
  completed_today: number;
}

export function fetchCheckins(user: string) {
  const resourcePath = `http://${localhost}/checkins/${user}`;
  return fetch(resourcePath).then((r) => {
    const body = r.json() as Promise<{ string: any }[]>;
    console.log("FETCH", r, "JSON", body);
    return body.then((b) =>
      b.map((i: any) => ({
        ...i,
        completed_at: Date.parse(i.completed_at as string),
      })),
    );
  });
}

export function markComplete(user: string, meditation: string) {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name: user, meditation }),
  };
  return fetch(`http://${localhost}/complete`, requestOptions).catch((e) =>
    console.log("EE", e),
  );
}

const state = hookstate<Checkin[]>([]);

export function useTasksState(): State<Checkin[]> {
  return useHookstate(state);
}
