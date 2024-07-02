import "dotenv/config"
import {
  connectDB,
  createListing,
  updateListing,
  getListingVersions,
  client,
} from "./services/listingService";

const run = async () => {
  await connectDB();

  const newListing = await createListing({
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

  const updatedListing = await updateListing(newListing._id!.toString(), {
    rating: 4.7,
    reviews: [...(newListing.reviews || []), "Amazing ambiance!"],
  });
  console.log("Updated Listing:", updatedListing);

  const versions = await getListingVersions(newListing._id!.toString());
  console.log("Listing Versions:", versions);

  await client.close();
};

run().catch((error) => console.error(error));
