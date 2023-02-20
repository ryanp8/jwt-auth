import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { prisma } from "../../prisma";

type ResData = {
  token?: string;
  message: string;
};

type ReqBody = {
  username: string;
  password: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResData>
) {
  // const prisma = new PrismaClient();
  const body: ReqBody = JSON.parse(req.body);

  const hashed = await bcrypt.hash(body.password, 10);
  const accessToken = jwt.sign(
    {
      data: body.username,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: 3 * 60 }
  );

  const refreshToken = jwt.sign(
    { data: body.username },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "1d" }
  );

  try {
    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        password: hashed,
        refreshToken,
      },
    });

    res.setHeader("Set-Cookie", [
      `${serialize("refreshToken", refreshToken)}; Path=/`,
      `${serialize("accessToken", accessToken)}; Path=/`,
    ]);

    res.status(200).json({ message: "User successfully created" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unable to create user" });
  }
}
