import fs from 'fs'
import {Collection, MongoClient, ServerApiVersion} from 'mongodb'
import express from 'express'
import {chromium} from 'playwright'
import viteExpress from "vite-express";
import {type TrackedEvent} from "../types.ts";
import {pipeline} from "./pipeline.ts";
// Load environment vars from .env file
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT as string
const uri = new URL(process.env.MONGO_URI as string);

// Configure MongoDB connection parameters
uri.username = process.env.MONGO_USER as string;
uri.password = process.env.MONGO_PASSWORD as string;
uri.searchParams.set('appName', process.env.MONGO_APP_NAME as string);

/**
 * Create MongoDB client
 */
const client = new MongoClient(uri.toString(), {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.json())

let collection: Collection<TrackedEvent>

async function run() {
  try {
    // Connect to the MongoDB
    await client.connect();
    const db = client.db()
    collection = db.collection<TrackedEvent>('events');

    // Create index for faster querying by action, success, and creation date
    await collection.createIndex({action: 1, success: 1, created_at: 1});

    await importEvents();

    /**
     * API endpoint to retrieve heatmap data for unlock events
     */
    app.get('/api/heatmap/unlock', async (_, res) => {
      try {
        const result = await collection.aggregate(pipeline).toArray();
        res.json(result);
      } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({error: 'Internal API error'});
      }
    });

    /**
     * Creates PDF from the print layout of the heatmap
     */
    app.get('/export-pdf', async (req, res) => {
      try {
        const browser = await chromium.launch({headless: true});
        const page = await browser.newPage();

        await page.goto(req.protocol + "://" + req.get('host'), {waitUntil: 'networkidle'});

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
        });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Report.pdf');

        res.end(pdfBuffer);
      } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).send('Error generating PDF');
      }
    });

    /**
     * Start the server and listen on the specified port
     */
    const server = app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`)
      console.log(`Server started on port ${PORT}`)
    });

    /**
     * Connects Vite to work with Express for both development and production
     */
    viteExpress.bind(app, server);

    /**
     * Handle graceful shutdown on SIGINT (Ctrl+C)
     */
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      try {
        await client.close();
        server.close(() => {
          console.log('Server and database connection closed');
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

/**
 * Imports events from events.json file if the collection is empty
 */
async function importEvents() {
  try {
    const count = await collection.countDocuments();

    if (count === 0) {
      const importedEvents = JSON.parse(fs.readFileSync('./src/events.json', 'utf8')) as TrackedEvent[];

      // Convert original string dates from JSON to Date objects
      importedEvents.forEach((event) => {
        if (event.created_at) {
          event.created_at = new Date(event.created_at);
        }
      });

      const result = await collection.insertMany(importedEvents);
      console.log(`${result.insertedCount} events imported successfully`);
    } else {
      console.log('Events collection already contains data, skipping import');
    }
  } catch (error) {
    console.error('Error importing events:', error);
  }
}

run()
