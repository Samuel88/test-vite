import { MongoClient } from 'mongodb'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export default async(request, context) => {
    const tokenSecret = process.env.TOKEN_SECRET;
    const dbUrl = process.env.MONGO_CONNECTION;

    const { name, email, password } = await request.json();

    const dbClient = new MongoClient(dbUrl);
    const connection = await dbClient.connect();
    const database = connection.db('sample_mflix');
    const collection = database.collection('users');
    const user = await collection.findOne({ email });

    if (user === null) { // Utente non trovato
        return Response.json({
            msg: 'Utente non trovato',
        });
    }

    // Controllo che la password sia uguale a quella del database
    const match = await bcrypt.compare(password, user.password);

    // Se la password non corrisponde
    if (!match) {
        return Response.json({
            msg: 'Password non corrispondente',
        });
    }

    // Creo il token jwt
    const jwtToken = jwt.sign({ id: user._id, email }, tokenSecret, {
        expiresIn: '10 days',
    });

    // Creo il cookie con il token
    const jwtCookie = cookie.serialize('jwt', jwtToken, {
        secure: process.env.NETLIFY_DEV !== "true",
        httpOnly: true,
        path: '/',
    });

    return Response.json({
        msg: 'All Done!',
    }, {
        headers: {
            'set-cookie': jwtCookie
        }
    });
}