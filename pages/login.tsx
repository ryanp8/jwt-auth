import React from "react";
import { GetServerSideProps } from "next";
import Router from "next/router";
import jwt from "jsonwebtoken";
import { checkToken } from "./api/refresh";
import { serialize } from "cookie";

export default function login() {
  const [usernameInput, setUsernameInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
      }),
    });
    Router.push("/");
  };

  return (
    <form>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => {
          setUsernameInput(e.target.value);
        }}
      ></input>
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => {
          setPasswordInput(e.target.value);
        }}
      ></input>
      <button type="submit" onClick={submit}>
        Login
      </button>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { accessToken, refreshToken } = ctx.req.cookies;
  console.log(accessToken);
  if (accessToken) {
    try {
      const decoded = await jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      );
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
    } catch (err) {
      console.log(err);
      if (!refreshToken) {
        return {
          props: {},
        };
      }

      const accessToken = await checkToken(refreshToken);
      if (accessToken) {
        ctx.res.setHeader("Set-Cookie", [
          `${serialize("refreshToken", refreshToken)}; Path=/`,
          `${serialize("accessToken", accessToken)}; Path=/`,
        ]);
        return {
          redirect: {
            permanent: false,
            destination: "/",
          },
        };
      }
      return { props: {} };
    }
  }
  return { props: {} };
};
