import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';


export default async (request, context) => {
    const tokenSecret = process.env.TOKEN_SECRET;
    const dbUrl = process.env.MONGO_CONNECTION;

    // Ottengo i dati della richiesta
    const { name, email, password } = await request.json();

    // Creo il client per connettermi al database
    const client = new MongoClient(dbUrl);

    // Mi connetto al database
    const connection = await client.connect();
    // Scelgo il database degli di netflix
    const database = connection.db('sample_mflix');
    // Scelgo la collezione degli utenti
    const collection = database.collection('users');
    // Cerco se l'utente esiste già nella collezione
    const user = await collection.findOne({ email });

    if (user !== null) { // Se l'utente esiste già
        return Response.json({
            msg: 'Utente già presente nel sistema'
        });
    }

    // Creo la hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Aggiungo il nuovo utente alla collezione
    const { insertedId } = await collection.insertOne({
        name,
        email,
        password: hashedPassword,
    });

    // Creo il token JWT con l'id e la mail
    const jwtToken = jwt.sign({id: insertedId, email}, tokenSecret, {
        expiresIn: '10 days'
    });

    // Creo il cookie con il token
    const jwtCookie = cookie.serialize('jwt', jwtToken, {
        secure: process.env.NETLIFY_DEV !== "true",
        httpOnly: true,
        path: '/',
    });

    return Response.json({
        msg: 'All done!',
    }, {
        headers: {
            'set-cookie': jwtCookie,
        }
    })

}