// Ejercicio CRUD         Gabriel Nassri

const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const mongoose = require("mongoose");
require('dotenv').config();


const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error));



  const libroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    autor: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    precio: { type: Number },
    url: { type: String },
  });

  const Libro = mongoose.model("Libro", libroSchema);

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Biblioteca",
      version: "1.0.0",
      description: "API para gestionar libros en una biblioteca",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./test.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Libro:
 *       type: object
 *       required:
 *         - titulo
 *         - autor
 *         - isbn
 *         - precio
 *         - url
 *       properties:
 *         titulo:
 *           type: string
 *           description: Título del libro
 *         autor:
 *           type: string
 *           description: Autor del libro
 *         isbn:
 *           type: string
 *           description: ISBN único del libro
 *         precio:
 *           type: number
 *           description: Precio del libro
 *         url:
 *           type: string
 *           description: URL de referencia o imagen del libro
 */

/**
 * @swagger
 * /biblioteca:
 *   post:
 *     summary: Crea un nuevo libro
 *     tags: [Libros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Libro'
 *     responses:
 *       201:
 *         description: Libro creado
 */
app.post("/biblioteca", async (req, res) => {
  try {
    const newLibro = new Libro(req.body);
    const savedLibro = await newLibro.save();
    res.status(201).json(savedLibro);
  } catch (error) {
    res.status(400).json({ message: "Error al agregar el libro", error });
  }
});

/**
 * @swagger
 * /biblioteca:
 *   get:
 *     summary: Obtiene todos los libros
 *     tags: [Libros]
 *     responses:
 *       200:
 *         description: Lista de libros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 */
app.get("/biblioteca", async (req, res) => {
  try {
    const libros = await Libro.find();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los libros", error });
  }
});

/**
 * @swagger
 * /biblioteca/{isbn}:
 *   get:
 *     summary: Obtiene un libro por ISBN
 *     tags: [Libros]
 *     parameters:
 *       - in: path
 *         name: isbn
 *         schema:
 *           type: string
 *         required: true
 *         description: ISBN del libro
 *     responses:
 *       200:
 *         description: Detalles del libro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Libro'
 *       404:
 *         description: Libro no encontrado
 */
app.get("/biblioteca/:isbn", async (req, res) => {
  try {
    const libro = await Libro.findOne({ isbn: req.params.isbn });
    if (!libro) return res.status(404).send("No se ha encontrado el libro.");
    res.json(libro);
  }  catch (error) {
    // Manejo de errores en caso de problemas en la consulta
    res.status(500).json({
      message: "Error al buscar el libro.",
      error: error.message});
  }
});

/**
 * @swagger
 * /biblioteca/{isbn}:
 *   put:
 *     summary: Actualiza un libro por ISBN
 *     tags: [Libros]
 *     parameters:
 *       - in: path
 *         name: isbn
 *         schema:
 *           type: string
 *         required: true
 *         description: ISBN del libro a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Libro'
 *     responses:
 *       200:
 *         description: Libro actualizado exitosamente
 *       404:
 *         description: Libro no encontrado
 */
app.put("/biblioteca/:isbn", async (req, res) => {
  try {
    const updatedLibro = await Libro.findOneAndUpdate(
      { isbn: req.params.isbn },
      req.body,                
      { new: true }              
    );

    if (!updatedLibro) {
      return res.status(404).json({ message: "Libro no encontrado." });
    }
    res.json(updatedLibro);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el libro.",
      error: error.message
    });
  }
});

/**
 * @swagger
 * /biblioteca/{isbn}:
 *   delete:
 *     summary: Elimina un libro por ISBN
 *     tags: [Libros]
 *     parameters:
 *       - in: path
 *         name: isbn
 *         schema:
 *           type: string
 *         required: true
 *         description: ISBN del libro a eliminar
 *     responses:
 *       200:
 *         description: Libro eliminado exitosamente
 *       404:
 *         description: Libro no encontrado
 */
app.delete("/biblioteca/:isbn", (req, res) => {
  const libroIndex = biblioteca.findIndex((i) => i.isbn === req.params.isbn);
  if (libroIndex === -1)
    return res.status(404).send("El libro no fue encontrado.");

  const deletedLibro = biblioteca.splice(libroIndex, 1);
  res.json(deletedLibro[0]);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});