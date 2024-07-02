import { MongoClient, ObjectId } from "mongodb";
import type { Listing, ListingVersion } from "../models/listing";

const url = process.env.MONGO_URI!;
const dbName = process.env.MONGODB_NAME;

export const client = new MongoClient(url);
const db = client.db(dbName);
const listingsCollection = db.collection<Listing>("listings");
const listingVersionsCollection = db.collection<ListingVersion>("listingVersions");

const connectWithRetry = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return;
  } catch (error) {
    console.error("Failed to connect to MongoDB...", error);
    throw new Error("Failed to connect to MongoDB");
  }
};

export const connectDB = async () => {
  try {
    await connectWithRetry();
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
  }
};

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
  if (!listing) throw new Error("Listing not found");

  const versionData = { ...listing, currentVersion: undefined, _id: undefined } as Omit<
    Listing,
    "currentVersion"
  >;
  await listingVersionsCollection.insertOne({
    ...versionData,
    listingId: objectId,
    version: listing.currentVersion || 1,
    createdAt: listing.createdAt!,
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
    { returnDocument: "after" }
  );

  return updateResult as Listing;
};

export const getListingVersions = async (listingId: string) => {
  const objectId = new ObjectId(listingId);
  return listingVersionsCollection.find({ listingId: objectId }).sort({ version: -1 }).toArray();
};

export const getById = async (id: string) => {
  const objectId = new ObjectId(id);
  const listing = await listingsCollection.findOne({ _id: objectId });
  if (listing) return listing;

  const version = await listingVersionsCollection.findOne(
    { listingId: objectId },
    { sort: { version: -1 } }
  );
  return version ? { ...version, _id: version.listingId } : null;
};
