const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'chistesDB';

const client = new MongoClient(url, { useNewUrlParser: true });

async function connectToDB() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos', error);
    }
}

async function createCollections() {
    const db = client.db(dbName);

    const collections = ['chistes', 'usuarios', 'tematicas'];

    for (const collection of collections) {
        await db.createCollection(collection);
        console.log(`Colección ${collection} creada`);
    }
}

async function insertData() {
    const db = client.db(dbName);

    const usuariosData = [
        { nombre: 'Manolito', contraseña: '123456' },
        { nombre: 'Pepe', contraseña: 'password' },
        { nombre: 'Isabel', contraseña: 'secure123' },
        { nombre: 'Pedro', contraseña: 'pass123' },
    ];

    const tematicasData = [
        { nombre: 'humor negro' },
        { nombre: 'humor amarillo' },
        { nombre: 'chistes verdes' },
    ];

    await db.collection('usuarios').insertMany(usuariosData);
    console.log('Usuarios creados');

    await db.collection('tematicas').insertMany(tematicasData);
    console.log('Temáticas creadas');

    const usuarios = await db.collection('usuarios').find().toArray();
    const tematicas = await db.collection('tematicas').find().toArray();

    for (const usuario of usuarios) {
        for (const tematica of tematicas) {
            const chistesData = Array.from({ length: 3 }, (_, index) => ({
                titulo: `Chiste ${index + 1}`,
                cuerpo: '...',
                autor: usuario, // Referencia al documento de usuario
                tematica: tematica, // Referencia al documento de tematica
            }));

            await db.collection('chistes').insertMany(chistesData);
        }
    }

    console.log('Datos insertados');
}

async function getAllChistesByUser(usuarioNombre) {
    const db = client.db(dbName);

    return await db.collection('chistes').find({ 'autor.nombre': usuarioNombre }).toArray();
}

async function getAllChistesByTematica(tematicaNombre) {
    const db = client.db(dbName);

    return await db.collection('chistes').find({ 'tematica.nombre': tematicaNombre }).toArray();
}

async function getAllChistesByUserAndTematica(usuarioNombre, tematicaNombre) {
    const db = client.db(dbName);

    return await db.collection('chistes')
        .find({ 'autor.nombre': usuarioNombre, 'tematica.nombre': tematicaNombre }).toArray();
}
async function constructAndInsertData() {
    await connectToDB();
    await createCollections();
    await insertData();
}

async function performQueries() {
    // Realizar consultas
    const chistesManolito = await getAllChistesByUser('Manolito');
    console.log('Chistes de Manolito:', chistesManolito);

    const humorNegroChistes = await getAllChistesByTematica('humor negro');
    console.log('Chistes de Humor Negro:', humorNegroChistes);

    const manolitoHumorNegroChistes = await getAllChistesByUserAndTematica('Manolito', 'humor negro');
    console.log('Chistes de Humor Negro creados por Manolito:', manolitoHumorNegroChistes);

    // Cierra la conexión después de realizar las consultas
    await client.close();
}

async function main() {
    await constructAndInsertData();
    await performQueries();
}

main();
