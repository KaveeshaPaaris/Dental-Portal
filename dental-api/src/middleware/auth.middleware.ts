import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { supabase } from '../config/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  full_name: string;
}

// Extend Express Request to carry the verified user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token by calling Supabase directly
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Supabase Auth Error:', authError?.message);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Fetch the admin's profile to get their role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      res.status(401).json({ error: 'Admin profile not found' });
      return;
    }

    if (!profile.is_active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
    };

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
