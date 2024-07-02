import { ObjectId } from "mongodb";

export interface Listing {
  _id?: ObjectId;
  name: string;
  address: string;
  phoneNumber: string;
  website?: string;
  rating?: number;
  reviews?: string[];
  openingHours?: string;
  photos?: string[];
  currentVersion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ListingVersion {
  _id?: ObjectId;
  listingId: ObjectId;
  version: number;
  data: Omit<Listing, "currentVersion">;
  createdAt?: Date;
  updatedAt?: Date;
}
