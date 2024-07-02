import {
  connectDB,
  save,
  getById,
  getByUrl,
  client,
} from "./services/listingService";

const run = async () => {
  await connectDB();

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
  console.log("Created Listing:", newListing);

  const retrievedListingByUrl = await getByUrl("http://cafegoodvibes.com");
  console.log("Retrieved Listing by URL:", retrievedListingByUrl);

  const retrievedListingById = await getById(newListing._id!.toString());
  console.log("Retrieved Listing by ID:", retrievedListingById);

  await client.close();
};

run().catch((error) => console.error(error));
