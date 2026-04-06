const http = require('http');

const request = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', error => reject(error));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  try {
    console.log("--- Starting Finance API Tests ---\n");

    console.log("1. Testing Authentication: Access without headers (Should Fail)");
    let res = await request('GET', '/api/dashboard/summary');
    console.log("Response:", res.body);

    console.log("\n2. Testing Anti-Gravity (RBAC): Admin Dashboard as 'Viewer' (Should Fail)");
    res = await request('GET', '/api/dashboard/summary', {
      'x-user-email': 'viewer@test.com',
      'x-user-role': 'Viewer'
    });
    console.log("Response:", res.body);

    console.log("\n3. Testing Validation: Create Record with missing 'amount' (Should Fail)");
    res = await request('POST', '/api/records', {
      'x-user-email': 'admin@demo.com',
      'x-user-role': 'Admin'
    }, {
      type: 'Income',
      category: 'Freelance'
    });
    console.log("Response:", res.body);

    console.log("\n4. Testing Creation: Creating Income Record as Admin (Should Pass)");
    res = await request('POST', '/api/records', {
      'x-user-email': 'admin@demo.com',
      'x-user-role': 'Admin'
    }, {
      amount: 5000,
      type: 'Income',
      category: 'Freelance',
      notes: 'Website Project'
    });
    console.log("Response:", res.body);

    console.log("\n5. Testing Creation: Creating Expense Record as Admin (Should Pass)");
    res = await request('POST', '/api/records', {
      'x-user-email': 'admin@demo.com',
      'x-user-role': 'Admin'
    }, {
      amount: 1500,
      type: 'Expense',
      category: 'Software Subscription'
    });
    console.log("Response:", res.body);

    console.log("\n6. Testing The Lift (Aggregation): Fetching Dashboard Summary as Analyst (Should Pass)");
    res = await request('GET', '/api/dashboard/summary', {
      'x-user-email': 'analyst@demo.com',
      'x-user-role': 'Analyst'
    });
    console.log("Response:", JSON.stringify(res.body, null, 2));

    console.log("\n--- Tests Completed Successfully! ---");
  } catch (err) {
    console.error("Test error:", err);
  }
};

runTests();
