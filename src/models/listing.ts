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
  url_hash?: string; // New field for URL hash
  currentVersion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ListingVersion {
  _id?: ObjectId;
  listingId: ObjectId;
  version: number;
  name: string;
  address: string;
  phoneNumber: string;
  website?: string;
  rating?: number;
  reviews?: string[];
  openingHours?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}
