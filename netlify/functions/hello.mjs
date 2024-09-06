import { MongoClient } from "mongodb";
import bcrypt from 'bcryptjs';

export default async (request, context) => {
    const dbUrl = process.env.MONGO_CONNECTION;

    const client = new MongoClient(dbUrl);
    let result = {};

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
            })
        }


    } catch (err) {

    } finally {
        client.close();
    }

    return Response.json(result);
}