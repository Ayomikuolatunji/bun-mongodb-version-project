import "dotenv/config";
import {
  connectDB,
  save,
  updateListing,
  getListingVersions,
  getById,
  getByUrl,
  client,
} from "./listingService";

describe("Listing Service", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await client.close();
  });

  it("should create a new listing", async () => {
    const newListing = await save({
      name: "Cafe Good Vibes",
      address: "123 Coffee St",
      phoneNumber: "555-1234",
      website: "http://cafegoodvibes.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    });
    expect(newListing).toHaveProperty("_id");
    expect(newListing).toHaveProperty("name", "Cafe Good Vibes")
  });

  it("should update the listing", async () => {
    const newListing = await save({
      name: "Cafe Good Vibes",
      address: "123 Coffee St",
      phoneNumber: "555-1234",
      website: "http://cafegoodvibes.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    });

    const updatedListing = await updateListing(newListing._id!.toString(), {
      rating: 4.7,
      reviews: [...(newListing.reviews || []), "Amazing ambiance!"],
    });
    expect(updatedListing?.rating).toBe(4.7);
  });

  it("should retrieve listing versions", async () => {
    const newListing = await save({
      name: "Cafe Good Vibes",
      address: "123 Coffee St",
      phoneNumber: "555-1234",
      website: "http://cafegoodvibes.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    });

    await updateListing(newListing._id!.toString(), {
      rating: 4.7,
      reviews: [...(newListing.reviews || []), "Amazing ambiance!"],
    });

    const versions = await getListingVersions(newListing._id!.toString());
    expect(versions.length).toBeGreaterThan(0);
  });

  it("should retrieve listing by ID", async () => {
    const newListing = await save({
      name: "Cafe Good Vibes",
      address: "123 Coffee St",
      phoneNumber: "555-1234",
      website: "http://cafegoodvibes.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    });

    const retrievedListing = await getById(newListing._id!.toString());
    expect(retrievedListing).toHaveProperty("_id", newListing._id);
  });

  it("should retrieve listing by URL", async () => {
    const newListing = await save({
      name: "Cafe Good Vibes",
      address: "123 Coffee St",
      phoneNumber: "555-1234",
      website: "http://cafegoodvibes.com",
      rating: 4.5,
      reviews: ["Great place!", "Love the coffee!"],
      openingHours: "8am - 8pm",
      photos: ["photo1.jpg", "photo2.jpg"],
    });

    const retrievedListing = await getByUrl("http://cafegoodvibes.com");
    expect(retrievedListing).toHaveProperty("_id", newListing._id);
  });
});
