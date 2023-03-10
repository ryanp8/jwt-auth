import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { checkToken } from "./api/refresh";
import { serialize } from "cookie";
import jwt, {JwtPayload} from "jsonwebtoken";
import { prisma } from "../prisma";

export default function Home({ data }) {
  React.useEffect(() => {
    console.log(data);
  }, []);

  return (
    <>
      <p className="text-3xl font-bold">Test</p>
      <p className="text-2xl">Hello</p>
      {data && data.todos.map((t: string) => (
        <p>{t}</p>
      ))}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  async function queryData(username: string) {
    const todos = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        todos: true,
      },
    });
    return todos;
  }

  const { accessToken, refreshToken } = ctx.req.cookies;
  // console.log('access', accessToken)
  // console.log('refresh', refreshToken)

  if (accessToken) {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as JwtPayload;
      const username: string = decoded.data;
      const data = await queryData(username);

      return {
        props: { data },
      };
    } catch {
      if (!refreshToken) {
        return {
          redirect: {
            permanent: false,
            destination: "/login",
          },
        };
      }
      const accessToken = await checkToken(refreshToken);
      if (accessToken) {
        ctx.res.setHeader("Set-Cookie", [
          `${serialize("refreshToken", refreshToken)}; Path=/`,
          `${serialize("accessToken", accessToken)}; Path=/`,
        ]);
        const decoded = await jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET as string
        ) as JwtPayload;
        const todos = await queryData(decoded.data);
        return {
          props: { todos },
        };
      }
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: "/login",
    },
  };
};
