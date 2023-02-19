import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

type ResData = {
  message: string;
};

export async function checkToken(refreshToken: string): Promise<null | string> {
  try {
    const decoded = await jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );
    if (decoded) {
      const accessToken = jwt.sign(
        { data: decoded },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: 3 * 60 }
      );
      return accessToken;
    }
  } catch (err) {
    console.log("expired refresh token");
  }
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResData>
) {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    const accessToken = await checkToken(refreshToken);
    if (accessToken) {
      res.setHeader("Set-Cookie", [
        `${serialize("refreshToken", refreshToken)}; Path=/`,
        `${serialize("accessToken", accessToken)}; Path=/`,
      ]);

      res
        .status(200)
        .json({ message: "successfully created new access token" });
      return;
    } else {
        res.status(401).json({message: 'no refreshToken'});
        return
    }

    // try {
    //   const decoded = await jwt.verify(
    //     refreshToken,
    //     process.env.REFRESH_TOKEN_SECRET as string
    //   );
    //   if (decoded) {
    //     const accessToken = jwt.sign(
    //       { data: decoded },
    //       process.env.ACCESS_TOKEN_SECRET as string,
    //       { expiresIn: 3 * 60 }
    //     );

    //     res.setHeader("Set-Cookie", [
    //       `${serialize("refreshToken", refreshToken)}; Path=/`,
    //       `${serialize("accessToken", accessToken)}; Path=/`,
    //     ]);

    //     res
    //       .status(200)
    //       .json({ message: "successfully created new access token" });
    //     return;
    //   }
    // } catch (err) {
    //   res.status(401).json({ message: "expired refresh token" });
    //   return;
    // }
  }

  res.status(401).json({ message: "no refresh token" });
}
