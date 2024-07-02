import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import type { Listing } from "../models/listing";
import { createHash } from "crypto";

const url = process.env.MONGO_URI!;
const dbName = process.env.MONGODB_NAME;

export const client = new MongoClient(url);
const db = client.db(dbName);
const listingsCollection = db.collection<Listing>("listings");
const listingVersionsCollection = db.collection<Listing>("listingVersions");

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
  }
};

const calculateHash = (url: string): string => {
  return createHash("sha256").update(url).digest("hex");
};

const isEqualExcludingMeta = (obj1: Listing, obj2: Listing): boolean => {
  const { meta: meta1, ...data1 } = obj1;
  const { meta: meta2, ...data2 } = obj2;
  return JSON.stringify(data1) === JSON.stringify(data2);
};

export const save = async (listingData: Listing) => {
  const urlHash = calculateHash(listingData.website || "");

  const existingListing = await listingsCollection.findOne({ url_hash: urlHash });

  if (existingListing) {
    const existingMeta = existingListing.meta || {
      currentVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!isEqualExcludingMeta(existingListing, listingData)) {
      const versionData = { ...existingListing, _id: undefined, meta: undefined } as Omit<
        Listing,
        "meta"
      >;
      await listingVersionsCollection.insertOne({
        ...versionData,
        listingId: existingListing._id,
        version: existingMeta.currentVersion,
        meta: {
          ...existingMeta,
          updatedAt: new Date(),
        },
      });

      const updatedMeta = {
        currentVersion: existingMeta.currentVersion + 1,
        createdAt: existingMeta.createdAt,
        updatedAt: new Date(),
      };

      const updateResult = await listingsCollection.findOneAndUpdate(
        { _id: existingListing._id },
        {
          $set: {
            ...listingData,
            url_hash: urlHash,
            meta: updatedMeta,
          },
        },
        { returnDocument: "after" }
      );

      return updateResult as Listing;
    } else {
      return existingListing;
    }
  } else {
    const newMeta = {
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await listingsCollection.insertOne({
      ...listingData,
      url_hash: urlHash,
      meta: newMeta,
    });

    return {
      ...listingData,
      _id: result.insertedId,
      url_hash: urlHash,
      meta: newMeta,
    };
  }
};

export const getById = async (id: string) => {
  const objectId = new ObjectId(id);
  return await listingsCollection.findOne({ _id: objectId });
};

export const getByUrl = async (url: string) => {
  const urlHash = calculateHash(url);
  return await listingsCollection.findOne({ url_hash: urlHash });
};

export const getListingVersions = async (listingId: string) => {
  const objectId = new ObjectId(listingId);
  return await listingVersionsCollection
    .find({ listingId: objectId })
    .sort({ version: -1 })
    .toArray();
};
