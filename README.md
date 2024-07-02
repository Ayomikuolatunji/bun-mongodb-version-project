Certainly! Here’s a comprehensive README for your `my-versioning-project`:

---

# My Versioning Project

This project demonstrates how to implement document versioning in MongoDB using TypeScript. We use `bun.sh` to manage our project dependencies and `mongoose` as our ODM for MongoDB. Docker is used to create a local MongoDB instance for testing.

## Prerequisites

Ensure you have the following installed on your system:

- [Bun](https://bun.sh) (v1.1.17)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

### Cloning the Repository

First, clone this repository to your local machine:

```bash
git clone <repository-url>
cd my-versioning-project
```

### Installing Dependencies

Install the required dependencies using Bun:

```bash
bun install
```

### Setting Up MongoDB

Create a `docker-compose.yml` file in the project root to set up MongoDB and Mongo Express:

```yaml
version: '3.1'

services:

  mongo:
    image: mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example

  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: example
      ME_CONFIG_MONGODB_URL: mongodb://root:example@mongo:27017/
      ME_CONFIG_BASICAUTH: false
```

Start the MongoDB and Mongo Express services:

```bash
docker-compose up -d
```

Verify the containers are running:

```bash
docker ps
```

### Running the Project

Run the project using Bun:

```bash
bun run index.ts
```

## Project Structure

- `index.ts`: Main entry point for the project.
- `services/listingService.ts`: Contains the logic for connecting to MongoDB, creating listings, updating listings, and retrieving listing versions.
- `models/listing.ts`: Defines the TypeScript types for listings and listing versions.

## Code Details

### Connecting to MongoDB

In `services/listingService.ts`, we define a `connectDB` function to connect to the MongoDB instance. We use a retry mechanism to handle potential delays in MongoDB startup:

```typescript
import { MongoClient } from 'mongodb';

const url = 'mongodb://root:example@localhost:27017';
const dbName = 'my-versioning-project';

export const client = new MongoClient(url);
const db = client.db(dbName);
const listingsCollection = db.collection<Listing>('listings');
const listingVersionsCollection = db.collection<ListingVersion>('listingVersions');

const connectWithRetry = async (retries: number = 5, delay: number = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
      return;
    } catch (error) {
      console.error('Failed to connect to MongoDB, retrying...', error);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
};

export const connectDB = async () => {
  try {
    await connectWithRetry();
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error);
  }
};
```

### Creating and Updating Listings

We define functions to create and update listings in `services/listingService.ts`:

```typescript
import { ObjectId } from 'mongodb';
import type { Listing, ListingVersion } from '../models/listing';

export const createListing = async (listingData: Listing) => {
  const result = await listingsCollection.insertOne({
    ...listingData,
    currentVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    ...listingData,
    _id: result.insertedId,
    currentVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const updateListing = async (listingId: string, updatedData: Partial<Listing>) => {
  const objectId = new ObjectId(listingId);
  const listing = await listingsCollection.findOne({ _id: objectId });
  if (!listing) throw new Error('Listing not found');

  const versionData = { ...listing, currentVersion: undefined, _id: undefined } as Omit<Listing, 'currentVersion'>;
  await listingVersionsCollection.insertOne({
    listingId: objectId,
    version: listing.currentVersion || 1,
    data: versionData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const updateResult = await listingsCollection.findOneAndUpdate(
    { _id: objectId },
    {
      $set: {
        ...updatedData,
        currentVersion: (listing.currentVersion || 1) + 1,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  return updateResult.value as Listing;
};
```

### Running the Example

In `index.ts`, we create a new listing, update it, and retrieve the version history:

```typescript
import {
  connectDB,
  createListing,
  updateListing,
  getListingVersions,
  client,
} from "./services/listingService";

const run = async () => {
  await connectDB();

  // Create a new listing
  const newListing = await createListing({
    name: "Cafe Good Vibes",
    address: "123 Coffee St",
    phoneNumber: "555-1234",
    website: "http://cafegoodvibes.com",
    rating: 4.5,
    reviews: ["Great place!", "Love the coffee!"],
    openingHours: "8am - 8pm",
    photos: ["photo1.jpg", "photo2.jpg"]
  });
  console.log("Created Listing:", newListing);

  // Update the listing
  const updatedListing = await updateListing(newListing._id!.toString(), {
    rating: 4.7,
    reviews: [...(newListing.reviews || []), "Amazing ambiance!"],
  });
  console.log("Updated Listing:", updatedListing);

  // Retrieve listing versions
  const versions = await getListingVersions(newListing._id!.toString());
  console.log("Listing Versions:", versions);

  await client.close();
};

run().catch((error) => console.error(error));
```

## License

This project is licensed under the MIT License.

---

Feel free to customize further based on your needs!