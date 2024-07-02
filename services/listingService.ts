import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import type { Listing, ListingVersion } from "../models/listing";

const uri = "mongodb://root:example@localhost:27017";
const dbName = "my-versioning-project";

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const db = client.db(dbName);
const listingsCollection = db.collection<Listing>("listings");
const listingVersionsCollection = db.collection<ListingVersion>("listingVersions");

export const connectDB = async () => {
  try {
    return await client.connect();
  } catch (error) {
    console.error(error);
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
    { returnDocument: "after" }
  );

  return updateResult as Listing;
};

export const getListingVersions = async (listingId: string) => {
  const objectId = new ObjectId(listingId);
  return listingVersionsCollection.find({ listingId: objectId }).sort({ version: -1 }).toArray();
};
