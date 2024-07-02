import { MongoClient, ObjectId } from "mongodb";
import { Listing, ListingVersion } from "../models/listing";
import crypto from "crypto";

const url = process.env.MONGO_URI!;
const dbName = process.env.MONGODB_NAME;

export const client = new MongoClient(url);
const db = client.db(dbName);
const listingsCollection = db.collection<Listing>("listings");
const listingVersionsCollection = db.collection<ListingVersion>("listingVersions");

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
  }
};

export const save = async (payload: Listing) => {
  const { website } = payload;
  const urlHash = website ? crypto.createHash("sha256").update(website).digest("hex") : undefined;

  const existingListing = await listingsCollection.findOne({ url_hash: urlHash });
  if (existingListing) {
    const versionData = { ...existingListing, _id: undefined } as Omit<Listing, "_id">;
    await listingVersionsCollection.insertOne({
      ...versionData,
      listingId: existingListing._id,
      version: existingListing.currentVersion || 1,
      createdAt: existingListing.createdAt!,
      updatedAt: new Date(),
    });

    const updateResult = await listingsCollection.findOneAndUpdate(
      { _id: existingListing._id },
      {
        $set: {
          ...payload,
          currentVersion: (existingListing.currentVersion || 1) + 1,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return updateResult as   Listing;
  } else {
    const result = await listingsCollection.insertOne({
      ...payload,
      url_hash: urlHash,
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      ...payload,
      _id: result.insertedId,
      url_hash: urlHash,
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
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

export const getByUrl = async (url: string) => {
  const urlHash = crypto.createHash("sha256").update(url).digest("hex");
  return listingsCollection.findOne({ url_hash: urlHash });
};

export const getListingVersions = async (listingId: string) => {
  const objectId = new ObjectId(listingId);
  return listingVersionsCollection.find({ listingId: objectId }).sort({ version: -1 }).toArray();
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
