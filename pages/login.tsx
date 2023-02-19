import React from "react";
import { GetServerSideProps } from "next";
import Router from 'next/router';
import jwt from "jsonwebtoken";

export default function login() {
  const [usernameInput, setUsernameInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");

  const submit = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
      }),
    });
    Router.push('/');
  };

  return (
    <>
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
      <button onClick={submit}>Login</button>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { accessToken } = ctx.req.cookies;
  if (accessToken) {
    try {
      const decoded = await jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      );
      console.log(decoded);
      if (!decoded) {
        return {
          props: {},
        };
      } else {
        return {
          redirect: {
            permanent: false,
            destination: "/",
          },
        };
      }
    } catch (err) {
      console.log(err);
    }
  }
  return { props: {} };
};
