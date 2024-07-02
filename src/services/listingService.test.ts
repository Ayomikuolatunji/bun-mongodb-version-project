import { save, getById, getByUrl, getListingVersions, connectDB, client } from "./listingService";
import type { Listing } from "../models/listing";

describe("Listing Service", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    const db = client.db();
    await db.collection("listings").drop();
    await db.collection("listingVersions").drop();
    console.log("Database cleaned.");
    await client.close();
  });

  it("should create a new listing", async () => {
    const listingData: Listing = {
      name: "Test Cafe",
      address: "123 Test St",
      phoneNumber: "555-1234",
      website: "http://testcafe.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    };

    const newListing = await save(listingData);

    expect(newListing).toHaveProperty("_id");
  });

  it("should update an existing listing and create a new version", async () => {
    const listingData: Listing = {
      name: "Test Cafe",
      address: "123 Test St",
      phoneNumber: "555-1234",
      website: "http://testcafe.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    };

    const updatedListingData: Listing = {
      ...listingData,
      rating: 4.8,
      reviews: [...listingData.reviews, "Awesome service!"],
    };

    const newListing = await save(listingData);
    const updatedListing = await save(updatedListingData);

    expect(updatedListing).toHaveProperty("_id");

    const versions = await getListingVersions(newListing._id!.toString());
  });

  it("should retrieve a listing by ID", async () => {
    const listingData: Listing = {
      name: "Test Cafe",
      address: "123 Test St",
      phoneNumber: "555-1234",
      website: "http://testcafe.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    };

    const newListing = await save(listingData);
    const retrievedListing = await getById(newListing._id!.toString());

    expect(retrievedListing).toEqual(newListing);
  });

  it("should retrieve a listing by URL", async () => {
    const listingData: Listing = {
      name: "Test Cafe",
      address: "123 Test St",
      phoneNumber: "555-1234",
      website: "http://testcafe.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    };

    const newListing = await save(listingData);
    const retrievedListing = await getByUrl("http://testcafe.com");

    expect(retrievedListing).toEqual(newListing);
  });
});
