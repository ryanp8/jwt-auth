import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { serialize } from "cookie";

import { prisma } from "../../prisma";

type ResData = {
  accessToken?: string;
  refreshToken?: string;
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

  const getUser = await prisma.user.findUnique({
    where: {
      username: body.username,
    },
  });

  if (getUser) {
    const match = await bcrypt.compare(body.password, getUser.password);
    const accessToken = jwt.sign(
      { data: body.username },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: 10 }
    );

    const refreshToken = jwt.sign(
      { data: body.username },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: 60 }
    );

    res.setHeader("Set-Cookie", [
      `${serialize("refreshToken", refreshToken)}; Path=/`,
      `${serialize("accessToken", accessToken)}; Path=/`,
    ]);

    if (match) {
      res.status(200).json({ message: "successfully logged in" });
      return;
    }
    res.status(401).json({ message: "incorrect password" });
    return;
  }
  res.status(401).json({ message: "User not found" });
}
