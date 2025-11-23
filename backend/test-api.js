#!/usr/bin/env node
/**
 * Comprehensive API test script
 * Tests the full flow: register -> login -> encryption -> submit -> logout
 */

import { request } from "http";
const BASE_URL = "http://localhost:3000";

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            raw: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            raw: data,
          });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test flow
async function runTests() {
  console.log("🚀 Starting API Test Suite\n");
  console.log("================================\n");

  const testUsername = `testuser_${Date.now()}`;
  const testPassword = "TestPassword123!";
  let accessToken = null;
  let refreshToken = null;
  let encryptionKey = null;

  try {
    // Test 1: Registration
    console.log("📝 TEST 1: User Registration");
    console.log("POST /auth/register");
    const registerRes = await makeRequest("POST", "/auth/register", {
      userId: testUsername,
      userPass: testPassword,
    });

    console.log(`Status: ${registerRes.status}`);
    console.log(`Response:`, JSON.stringify(registerRes.body, null, 2));

    if (registerRes.status !== 201) {
      throw new Error(
        `Registration failed with status ${registerRes.status}: ${registerRes.body?.error}`
      );
    }

    accessToken = registerRes.body.accessToken;
    refreshToken = registerRes.body.refreshToken;
    const userId = registerRes.body.user.uuid;

    console.log("✅ Registration successful!\n");
    console.log(`User ID: ${userId}`);
    console.log(`Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`Refresh Token: ${refreshToken.substring(0, 20)}...\n`);

    // Test 2: Login
    console.log("================================\n");
    console.log("🔐 TEST 2: User Login");
    console.log("POST /auth/login");

    const loginRes = await makeRequest("POST", "/auth/login", {
      userId: testUsername,
      userPass: testPassword,
    });

    console.log(`Status: ${loginRes.status}`);
    console.log(`Response:`, JSON.stringify(loginRes.body, null, 2));

    if (loginRes.status !== 200) {
      throw new Error(
        `Login failed with status ${loginRes.status}: ${loginRes.body?.error}`
      );
    }

    // Use new tokens from login
    accessToken = loginRes.body.accessToken;
    refreshToken = loginRes.body.refreshToken;

    console.log("✅ Login successful!\n");

    // Test 3: Request Encryption Key
    console.log("================================\n");
    console.log("🔑 TEST 3: Request Encryption Key");
    console.log("POST /encryption");

    const encryptionRes = await makeRequest(
      "POST",
      "/encryption",
      {},
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    console.log(`Status: ${encryptionRes.status}`);
    console.log(`Response:`, JSON.stringify(encryptionRes.body, null, 2));

    if (encryptionRes.status !== 200) {
      throw new Error(
        `Encryption key request failed with status ${encryptionRes.status}: ${encryptionRes.body?.error}`
      );
    }

    encryptionKey = encryptionRes.body.encryptionKey;
    console.log("✅ Encryption key generated!\n");
    console.log(`Encryption Key: ${encryptionKey.substring(0, 20)}...\n`);

    // Test 4: Submit Encrypted Data
    console.log("================================\n");
    console.log("📤 TEST 4: Submit Encrypted Data");
    console.log("POST /api/submit");

    // Simulate encrypted data (in real scenario, this would be encrypted with the encryptionKey)
    const mockEncryptedData = Buffer.from("sensitive_data_here").toString(
      "base64"
    );

    const submitRes = await makeRequest(
      "POST",
      "/api/submit",
      {
        encryptedData: mockEncryptedData,
      },
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    console.log(`Status: ${submitRes.status}`);
    console.log(`Response:`, JSON.stringify(submitRes.body, null, 2));

    if (submitRes.status !== 202) {
      throw new Error(
        `Submit failed with status ${submitRes.status}: ${submitRes.body?.error}`
      );
    }

    const jobId = submitRes.body.jobId;
    console.log("✅ Data submitted successfully!\n");
    console.log(`Job ID: ${jobId}\n`);

    // Test 5: Logout
    console.log("================================\n");
    console.log("🚪 TEST 5: User Logout");
    console.log("POST /auth/logout");

    const logoutRes = await makeRequest("POST", "/auth/logout", {
      refreshToken,
    });

    console.log(`Status: ${logoutRes.status}`);
    console.log(`Response:`, JSON.stringify(logoutRes.body, null, 2));

    if (logoutRes.status !== 200) {
      throw new Error(
        `Logout failed with status ${logoutRes.status}: ${logoutRes.body?.error}`
      );
    }

    console.log("✅ Logout successful!\n");

    // Test 6: Verify token is invalidated (optional bonus test)
    console.log("================================\n");
    console.log("🧪 TEST 6: Verify Invalidated Token (Bonus)");
    console.log("POST /auth/me (should fail)");

    const invalidTokenRes = await makeRequest(
      "POST",
      "/auth/me",
      {},
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    console.log(`Status: ${invalidTokenRes.status}`);
    console.log(`Response:`, JSON.stringify(invalidTokenRes.body, null, 2));

    if (invalidTokenRes.status === 401) {
      console.log("✅ Token correctly invalidated!\n");
    } else {
      console.log(
        "⚠️  Token still valid (might be expected depending on implementation)\n"
      );
    }

    // Summary
    console.log("================================\n");
    console.log("🎉 ALL TESTS PASSED!\n");
    console.log("Test Summary:");
    console.log("  ✅ User Registration");
    console.log("  ✅ User Login");
    console.log("  ✅ Encryption Key Generation");
    console.log("  ✅ Data Submission");
    console.log("  ✅ User Logout");
    console.log("\n================================\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED!");
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Wait for server to be ready
async function waitForServer(maxAttempts = 10, delay = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await makeRequest("GET", "/health");
      if (res.status === 200) {
        console.log("✅ Server is ready!\n");
        return;
      }
    } catch {
      // Server not ready yet
    }
    if (i < maxAttempts - 1) {
      console.log(
        `Waiting for server to start... (${i + 1}/${maxAttempts - 1})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Server did not start in time");
}

// Run everything
(async () => {
  try {
    await waitForServer();
    await runTests();
  } catch (error) {
    console.error("Fatal error:", error.message);
    process.exit(1);
  }
})();
