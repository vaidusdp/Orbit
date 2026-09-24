import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { db } from "../db/index.js";
import { userTable } from "../db/schema.js";
import { userInfo } from "os";

interface RegisterInput {
    name: string,
    email: string,
    password: string,
}

interface LoginInput {
    email: string,
    password: string,
}

async function registerUser({
    name,
    email,
    password
}: RegisterInput) {
    const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1);

    if (existingUser.length > 0) {
        throw new Error("User with this email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
        .insert(userTable)
        .values({
            name,
            email,
            passwordHash: passwordHash
        })
        .returning({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email
        })

    return user;
};

async function loginUser({
    email,
    password
} : LoginInput) {
    const [user] = await db   
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1);

    if(!user){
        throw new Error("User with this email does not exists!");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if(!passwordMatch){
        throw new Error("Invalid Credentials!");
    }

    const accessToken = jwt.sign(
        {
            userId: user.id,
            userEmail: user.email
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY! as jwt.SignOptions["expiresIn"]
        }
    );

    const refreshToken = jwt.sign(
        {
            userId: user.id
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY! as jwt.SignOptions["expiresIn"]
        }
    )
    
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
        refreshToken
    };
};



export {
    registerUser,
    loginUser
}
