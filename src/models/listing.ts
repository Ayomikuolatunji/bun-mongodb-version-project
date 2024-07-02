import { ObjectId } from "mongodb";

export interface Listing {
  _id?: ObjectId;
  name: string;
  address: string;
  phoneNumber: string;
  website: string;
  rating: number;
  reviews: string[];
  openingHours: string;
  photos: string[];
  url_hash?: string;
  meta?: {
    currentVersion: number;
    createdAt: Date;
    updatedAt: Date;
  };
  listingId?: ObjectId;
  version?: number;
}

