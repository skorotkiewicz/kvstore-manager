import { KVStore } from "kvstore-client";

const API_URL = "https://kv.sekor.eu.org/api/connect";

function generateRandomData() {
  const types = ["string", "number", "array", "object"];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case "string":
      return `sample_string_${Math.random().toString(36).substring(7)}`;
    case "number":
      return Math.floor(Math.random() * 1000);
    case "array":
      return Array.from({ length: 3 }, () => Math.floor(Math.random() * 100));
    case "object":
      return {
        id: Math.floor(Math.random() * 1000),
        name: `object_${Math.random().toString(36).substring(7)}`,
        active: Math.random() > 0.5,
        tags: ["tag1", "tag2"],
      };
  }
}

async function createDemoData() {
  console.log("🚀 Starting KVStore Demo...\n");

  // You'll need to replace this with your actual access token
  const ACCESS_TOKEN = "your_access_token_here";

  if (ACCESS_TOKEN === "your_access_token_here") {
    console.error("❌ Please set your ACCESS_TOKEN in the demo script");
    console.log("To get a token:");
    console.log("1. Register/login through the web UI");
    console.log("2. Go to Settings and copy your access token");
    console.log('3. Replace "your_access_token_here" in this script\n');
    return;
  }

  try {
    // Initialize KVStore client
    const kvStore = new KVStore(API_URL, { accessToken: ACCESS_TOKEN });

    // Create demo database
    const dbName = "demo_database";
    console.log(`📁 Creating database: ${dbName}`);
    try {
      await kvStore.createDatabase(dbName);
      console.log("✅ Database created successfully\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️ Database already exists, continuing...\n");
      } else {
        throw error;
      }
    }

    // Create multiple stores with different data types
    const stores = [
      { name: "users_store", description: "Store for user objects" },
      { name: "settings_store", description: "Store for configuration" },
      { name: "metrics_store", description: "Store for numeric data" },
      { name: "mixed_store", description: "Store with mixed data types" },
    ];

    for (const store of stores) {
      console.log(`🗄️ Creating store: ${store.name} - ${store.description}`);

      // Create store
      try {
        await kvStore.createStore(dbName, store.name);
        console.log("✅ Store created");
      } catch (error) {
        if (error.message.includes("already exists")) {
          console.log("ℹ️ Store already exists");
        } else {
          throw error;
        }
      }

      // Initialize KVStore instance for this specific store
      const storeClient = new KVStore(API_URL, {
        accessToken: ACCESS_TOKEN,
        dbName: dbName,
        storeName: store.name,
      });

      // Clear existing data
      await storeClient.clear();

      // Add sample data based on store type
      switch (store.name) {
        case "users_store":
          await storeClient.set("user_1", {
            id: 1,
            username: "john_doe",
            email: "john@example.com",
            age: 25,
            preferences: ["dark_mode", "notifications"],
            profile: {
              bio: "Software developer",
              location: "New York",
            },
          });

          await storeClient.set("user_2", {
            id: 2,
            username: "jane_smith",
            email: "jane@example.com",
            age: 30,
            preferences: ["light_mode"],
            profile: {
              bio: "Designer",
              location: "California",
            },
          });
          break;

        case "settings_store":
          await storeClient.set("app_config", {
            version: "1.0.0",
            features: ["auth", "notifications", "analytics"],
            limits: {
              max_users: 1000,
              max_storage: "10GB",
            },
          });

          await storeClient.set("theme", "dark");
          await storeClient.set("language", "en");
          await storeClient.set("debug_mode", true);
          break;

        case "metrics_store":
          await storeClient.set("daily_active_users", 1250);
          await storeClient.set("server_uptime", 99.9);
          await storeClient.set("response_times", [120, 95, 140, 85, 110]);
          await storeClient.set("error_count", 3);
          break;

        case "mixed_store":
          // Add various data types
          for (let i = 1; i <= 10; i++) {
            const key = `item_${i}`;
            const value = generateRandomData();
            await storeClient.set(key, value);
          }

          // Add some specific examples
          await storeClient.set("simple_string", "Hello, World!");
          await storeClient.set("simple_number", 42);
          await storeClient.set("simple_boolean", true);
          await storeClient.set("simple_array", [1, 2, 3, "four", true]);
          await storeClient.set("complex_object", {
            nested: {
              data: {
                deep: "value",
                array: [{ id: 1 }, { id: 2 }],
              },
            },
          });
          break;
      }

      // Show what was added
      const entries = await storeClient.entries();
      console.log(`📊 Added ${entries.length} items to ${store.name}`);

      // Show sample data
      console.log("Sample data:");
      entries.slice(0, 3).forEach(([key, value]) => {
        console.log(
          `  ${key}: ${typeof value === "object" ? JSON.stringify(value, null, 2).slice(0, 100) + "..." : value}`,
        );
      });
      console.log("");
    }

    console.log("🎉 Demo data created successfully!");
    console.log("\nYou can now:");
    console.log(
      "1. Open the web UI at http://localhost:5173 (dev) or http://localhost:3001 (prod)",
    );
    console.log("2. Navigate to the demo_database");
    console.log("3. Explore the different stores and their data");
    console.log("\nStores created:");
    stores.forEach((store) => {
      console.log(`  - ${store.name}: ${store.description}`);
    });
  } catch (error) {
    console.error("❌ Error creating demo data:", error.message);
  }
}

// Run the demo
createDemoData();
