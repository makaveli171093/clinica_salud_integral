import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export async function register(req: Request, res: Response) {
  /*  #swagger.tags = ['Autenticación']
      #swagger.summary = 'Registrar una cuenta de usuario'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Credenciales del nuevo usuario',
        required: true,
        schema: {
          email: 'usuario@clinica.com',
          password: 'password123',
          role: 'RECEPCIONISTA'
        }
      }
  */
  try {
    const { email, password, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
      select: { id: true, email: true, role: true, isActive: true },
    });

    res.status(201).json(user);
  } catch {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
}

export async function login(req: Request, res: Response) {
  /*  #swagger.tags = ['Autenticación']
      #swagger.summary = 'Iniciar sesión y obtener Bearer Token'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Credenciales de acceso',
        required: true,
        schema: {
          email: 'recepcion@clinica.com',
          password: 'Clinica123!'
        }
      }
  */
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas o cuenta desactivada" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" },
    );

    res.json({ token });
  } catch {
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
}
