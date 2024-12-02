const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();

app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a la base de datos MongoDB"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error));

// Esquema para los libros
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  price: { type: Number },
  imageUrl: { type: String },
});

// Modelo de Libro
const Book = mongoose.model("Book", bookSchema);

// Configuración de Swagger
const swaggerConfig = {
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
  apis: ["./routes.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerConfig);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *         - price
 *         - imageUrl
 *       properties:
 *         title:
 *           type: string
 *           description: Título del libro
 *         author:
 *           type: string
 *           description: Autor del libro
 *         isbn:
 *           type: string
 *           description: ISBN único del libro
 *         price:
 *           type: number
 *           description: Precio del libro
 *         imageUrl:
 *           type: string
 *           description: URL de referencia o imagen del libro
 */

/**
 * @swagger
 * /CRUD:
 *   post:
 *     summary: Crear un nuevo libro
 *     tags: [Libros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Libro creado con éxito
 */
app.post("/CRUD", async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: "Error al crear el libro", error });
  }
});

/**
 * @swagger
 * /CRUD:
 *   get:
 *     summary: Obtener todos los libros
 *     tags: [Libros]
 *     responses:
 *       200:
 *         description: Lista de libros disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
app.get("/CRUD", async (req, res) => {
  try {
    const allBooks = await Book.find();
    res.json(allBooks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los libros", error });
  }
});

/**
 * @swagger
 * /CRUD/{isbn}:
 *   get:
 *     summary: Obtener un libro por ISBN
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
 *       404:
 *         description: Libro no encontrado
 */
app.get("/CRUD/:isbn", async (req, res) => {
  try {
    const book = await Book.findOne({ isbn: req.params.isbn });
    if (!book) return res.status(404).send("Libro no encontrado.");
    res.json(book);
  } catch (error) {
    res.status(500).json({
      message: "Error al buscar el libro.",
      error: error.message
    });
  }
});

/**
 * @swagger
 * /CRUD/{isbn}:
 *   put:
 *     summary: Actualizar un libro por ISBN
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
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Libro actualizado con éxito
 *       404:
 *         description: Libro no encontrado
 */
app.put("/CRUD/:isbn", async (req, res) => {
  try {
    const updatedBook = await Book.findOneAndUpdate(
      { isbn: req.params.isbn },
      req.body,                
      { new: true }             
    );
    if (!updatedBook) {
      return res.status(404).json({ message: "Libro no encontrado." });
    }
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el libro.",
      error: error.message
    });
  }
});

/**
 * @swagger
 * /CRUD/{isbn}:
 *   delete:
 *     summary: Eliminar un libro por ISBN
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
app.delete("/CRUD/:isbn", async (req, res) => {
  try {
    const deletedBook = await Book.findOneAndDelete({ isbn: req.params.isbn });
    if (!deletedBook) {
      return res.status(404).send("Libro no encontrado.");
    }
    res.json(deletedBook);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el libro.",
      error: error.message
    });
  }
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});
