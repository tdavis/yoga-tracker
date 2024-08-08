/* eslint-env jest */

import { renderRouter, screen } from "expo-router/testing-library";
import { Text } from "react-native";
import RootLayout from "../_layout";
import Root from "@/app/_layout";
import { useSession } from "@/components/auth";
import { Redirect } from "expo-router";
import { useEffect } from "react";

it("redirects to login without session", async () => {
  const Index = jest.fn(() => <Text>Index</Text>);
  const Login = jest.fn(() => <Text>Login</Text>);

  renderRouter({
    _layout: jest.fn(() => <Root />),
    "(app)/_layout": jest.fn(() => <RootLayout />),
    "(app)/index": Index,
    "/login": Login,
  });

  expect(await screen.findByText("Login")).toBeOnTheScreen();
  expect(Login).toHaveBeenCalledTimes(1);
});

it("stores session and permits access", async () => {
  const Index = jest.fn(() => {
    const { session } = useSession();
    return <Text>{session}</Text>;
  });
  const Stats = jest.fn(() => <Text>Stats</Text>);
  const Login = jest.fn(() => {
    const { signIn } = useSession();
    useEffect(() => signIn("foo"), [signIn]);
    return <Redirect href="/" />;
  });

  renderRouter({
    _layout: jest.fn(() => <Root />),
    "(app)/_layout": jest.fn(() => <RootLayout />),
    "(app)/index": Index,
    "(app)/stats": Stats,
    "/login": Login,
  });

  expect(await screen.findByText("foo")).toBeOnTheScreen();
});
