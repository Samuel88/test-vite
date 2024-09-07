import { MongoClient } from "mongodb";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async (request, context) => {
    const tokenSecret = process.env.TOKEN_SECRET;
    const dbUrl = process.env.MONGO_CONNECTION;

    const jwtCookieIn = context.cookies.get('jwt');
    const payload = jwt.verify(jwtCookieIn, tokenSecret);

    console.log(payload);

    const client = new MongoClient(dbUrl);
    let result = {};
    let jwtCookie = '';

    const { name, email, password } = await request.json();

    try {
        const connection = await client.connect();
        const database = connection.db('sample_mflix');
        const collection = database.collection('users');
        result = await collection.findOne({ email });

        if (result === null) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const { insertedId } = await collection.insertOne({
                name,
                email,
                password: hashedPassword
            });
        }

        const token = jwt.sign({email}, tokenSecret, {
            expiresIn: '1 days'
        });

        jwtCookie = cookie.serialize('jwt', token, {
            secure: process.env.NETLIFY_DEV !== "true",
            httpOnly: true,
            path: '/',
        });

    } catch (err) {

    } finally {
        client.close();
    }

    return Response.json(result, {
        headers: {
            'content-type': 'application/json',
            'set-cookie': jwtCookie,
        }
    });
}