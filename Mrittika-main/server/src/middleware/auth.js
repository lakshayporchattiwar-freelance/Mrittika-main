import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { env } from "../config.js";
import { supabase } from "../supabaseClient.js";

const jwks = jwksClient({
  jwksUri: `${env.SUPABASE_JWT_ISSUER}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (error, key) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null, key.getPublicKey());
  });
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const token = authHeader.replace("Bearer ", "");

  jwt.verify(
    token,
    getKey,
    {
      issuer: env.SUPABASE_JWT_ISSUER,
      audience: env.SUPABASE_JWT_AUDIENCE,
    },
    (error, decoded) => {
      if (error) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
      req.user = decoded;
      next();
    }
  );
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Invalid bearer token" });
    return;
  }

  const token = authHeader.replace("Bearer ", "");

  jwt.verify(
    token,
    getKey,
    {
      issuer: env.SUPABASE_JWT_ISSUER,
      audience: env.SUPABASE_JWT_AUDIENCE,
    },
    (error, decoded) => {
      if (error) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
      req.user = decoded;
      next();
    }
  );
}

export async function requireAdmin(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", req.user.sub)
      .single();

    if (error || !data?.is_admin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
