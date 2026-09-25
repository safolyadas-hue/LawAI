import crypto from "crypto";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const appSecret = process.env.APP_SECRET;
  if (!appSecret) {
    console.error("Missing APP_SECRET");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }

  const expiry = Date.now() + 60000; // 60 seconds
  const data = expiry.toString();
  const signature = crypto.createHmac("sha256", appSecret).update(data).digest("hex");
  const token = `${data}.${signature}`;

  return Response.json({ token });
};
