import { writeBatch, doc, collection } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "sonner";

const mockEvents = [
  { name: "Neon Nights: Battle of the Bands", cat: "Cultural", venue: "Main Auditorium", desc: "The ultimate showdown of the best college bands.", type: "Pro Show" },
  { name: "HackFest 2026", cat: "Tech", venue: "Computer Lab 1", desc: "48-hour continuous hackathon to build the next big thing.", type: "Hackathon" },
  { name: "RoboWars: Steel & Sparks", cat: "Tech", venue: "Engineering Courtyard", desc: "Custom built robots battle it out in the arena.", type: "Competition" },
  { name: "Fashion Walk", cat: "Cultural", venue: "Open Air Theatre", desc: "Annual fashion show featuring student designers and models.", type: "Pro Show" },
  { name: "E-Sports Tournament: Valorant", cat: "Sports", venue: "Gaming Arena", desc: "5v5 tactical shooter tournament with cash prizes.", type: "Competition" },
  { name: "Startup Pitch Deck", cat: "Business", venue: "Seminar Hall", desc: "Pitch your startup idea to real investors.", type: "Workshop" },
  { name: "Standup Comedy Night", cat: "Cultural", venue: "Main Auditorium", desc: "Laugh out loud with top standup comedians.", type: "Pro Show" },
  { name: "AI/ML Workshop", cat: "Tech", venue: "Lab 3", desc: "Hands-on workshop on training neural networks.", type: "Workshop" },
  { name: "Inter-College Debate", cat: "Literary", venue: "Conference Room A", desc: "War of words on current global topics.", type: "Competition" },
  { name: "Photography Walk", cat: "Art", venue: "Campus Grounds", desc: "Guided photography tour around the scenic campus.", type: "Workshop" },
  { name: "Dance Off: Solo & Group", cat: "Cultural", venue: "Open Air Theatre", desc: "Showcase your best moves in front of celebrity judges.", type: "Competition" },
  { name: "Cybersecurity Capture The Flag", cat: "Tech", venue: "Computer Lab 2", desc: "Find the vulnerabilities and capture the flag.", type: "Hackathon" },
  { name: "Street Play (Nukkad Natak)", cat: "Cultural", venue: "Student Plaza", desc: "Powerful social messages delivered through street theatre.", type: "Competition" },
  { name: "IoT Home Automation Build", cat: "Tech", venue: "Electronics Lab", desc: "Build your own smart home devices from scratch.", type: "Workshop" },
  { name: "Chess Masters", cat: "Sports", venue: "Library Reading Room", desc: "Rapid chess tournament.", type: "Competition" },
  { name: "Food Fest: Culinary Wars", cat: "Misc", venue: "Cafeteria Grounds", desc: "Students compete to make the best street food.", type: "Misc" },
  { name: "Short Film Festival", cat: "Art", venue: "Seminar Hall", desc: "Screening of student-made short films.", type: "Pro Show" },
  { name: "Guest Lecture: Future of Space Tech", cat: "Tech", venue: "Main Auditorium", desc: "Talk by a leading ISRO scientist.", type: "Workshop" },
  { name: "Treasure Hunt", cat: "Misc", venue: "Entire Campus", desc: "Solve clues and find the hidden treasure.", type: "Competition" },
  { name: "Closing Ceremony & DJ Night", cat: "Cultural", venue: "Main Field", desc: "The grand finale with an EDM night.", type: "Pro Show" },
];

export async function seedDatabase() {
  try {
    const batch = writeBatch(db);
    
    // Generate dates: some in the past, mostly in the future
    const now = new Date();
    
    for (let i = 0; i < mockEvents.length; i++) {
      const e = mockEvents[i];
      const eventRef = doc(collection(db, "events"));
      
      const eventDate = new Date();
      eventDate.setDate(now.getDate() + (i - 2)); // Spread dates around today
      
      batch.set(eventRef, {
        name: e.name,
        description: e.desc,
        category: e.cat,
        venue: e.venue,
        event_date: eventDate.toISOString(),
        starts_at: eventDate.toISOString(),
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Generate 1-3 items per event
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numItems; j++) {
        const itemRef = doc(collection(db, `events/${eventRef.id}/items`));
        const price = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 50) * 100; // Free or ₹100-5000
        const capacity = Math.floor(Math.random() * 100) + 20;
        
        batch.set(itemRef, {
          name: numItems === 1 ? "General Entry" : `Pass Type ${j + 1}`,
          price_cents: price,
          capacity: capacity,
          booked_count: Math.floor(Math.random() * (capacity / 2)), // somewhat booked
          available: true
        });
      }
    }

    await batch.commit();
    toast.success("Successfully seeded 20 events!");
  } catch (error) {
    console.error("Error seeding:", error);
    toast.error("Failed to seed database.");
  }
}
