const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 MongoDB Atlas Production Environment Diagnostic');
console.log('=================================================');

async function checkProductionConfig() {
  const mongoUrl = process.env.MONGO_URL;
  
  console.log('📋 ENVIRONMENT VARIABLES:');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('   PORT:', process.env.PORT || 'undefined');
  console.log('   MONGO_URL exists:', !!mongoUrl);
  
  if (mongoUrl) {
    // Parse MongoDB URL for detailed analysis
    console.log('\n🔗 MONGODB CONNECTION STRING ANALYSIS:');
    console.log('   Full URL (sanitized):', mongoUrl.replace(/\/\/[^:]*:[^@]*@/, '//***:***@'));
    
    // Extract components
    const urlParts = mongoUrl.match(/mongodb\+srv:\/\/([^:]*):([^@]*)@([^\/]*)\/(.*)\?(.*)/);
    if (urlParts) {
      const [, username, password, cluster, database, params] = urlParts;
      console.log('   Protocol: mongodb+srv (Atlas)');
      console.log('   Username:', username);
      console.log('   Password length:', password ? password.length + ' chars' : 'MISSING');
      console.log('   Cluster host:', cluster);
      console.log('   Database name:', database);
      console.log('   Connection params:', params);
      
      // Check common Atlas issues
      console.log('\n🚨 ATLAS-SPECIFIC CHECKS:');
      if (cluster.includes('cluster0')) {
        console.log('   ✅ Using default cluster name');
      }
      if (params.includes('retryWrites=true')) {
        console.log('   ✅ Retry writes enabled');
      }
      if (params.includes('w=majority')) {
        console.log('   ✅ Write concern set to majority');
      }
      if (!params.includes('maxIdleTimeMS')) {
        console.log('   ⚠️  No maxIdleTimeMS configured (may cause idle timeouts)');
      }
      if (!params.includes('serverSelectionTimeoutMS')) {
        console.log('   ⚠️  No serverSelectionTimeoutMS in URL (using code config)');
      }
    }
  }

  console.log('\n⏱️ TIMING AND PERFORMANCE TESTS:');
  console.log('Testing different timeout scenarios...');

  // Test various timeout configurations
  const timeoutTests = [
    { name: 'Quick (5s)', timeout: 5000 },
    { name: 'Standard (15s)', timeout: 15000 }, 
    { name: 'Extended (30s)', timeout: 30000 },
    { name: 'Maximum (60s)', timeout: 60000 }
  ];

  for (const test of timeoutTests) {
    console.log(`\n🕐 Testing ${test.name} timeout...`);
    
    try {
      const startTime = Date.now();
      
      const connection = await mongoose.createConnection(mongoUrl, {
        serverSelectionTimeoutMS: test.timeout,
        connectTimeoutMS: test.timeout,
        socketTimeoutMS: test.timeout * 2,
        maxPoolSize: 1, // Single connection for testing
      });
      
      const connectTime = Date.now() - startTime;
      console.log(`   ✅ ${test.name}: Connected in ${connectTime}ms`);
      
      // Quick write test
      const TestModel = connection.model('TimeoutTest', new mongoose.Schema({
        test: String,
        timestamp: Date,
        timeout: Number
      }));
      
      const writeStart = Date.now();
      const doc = await TestModel.create({
        test: 'timeout-test',
        timestamp: new Date(),
        timeout: test.timeout
      });
      const writeTime = Date.now() - writeStart;
      
      console.log(`   📝 Write test: ${writeTime}ms`);
      
      // Cleanup
      await TestModel.deleteOne({ _id: doc._id });
      await connection.close();
      
      console.log(`   🔌 Disconnected successfully`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`   ❌ ${test.name}: FAILED after ${duration}ms`);
      console.error(`      Error: ${error.message}`);
      
      if (error.message.includes('timeout') || error.code === 'ETIMEOUT') {
        console.error(`      🚨 TIMEOUT CONFIRMED with ${test.timeout}ms limit`);
      }
    }
  }

  console.log('\n🔍 CONNECTION POOL & CLUSTER ANALYSIS:');
  
  try {
    // Test with production-like settings
    console.log('Testing with production connection pool settings...');
    const prodConnection = await mongoose.createConnection(mongoUrl, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000, 
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    });

    console.log('✅ Production settings: Connection successful');
    
    // Test multiple rapid writes (simulate production load)
    const LoadTestModel = prodConnection.model('LoadTest', new mongoose.Schema({
      data: mongoose.Schema.Types.Mixed,
      timestamp: Date
    }));
    
    console.log('🏋️ Testing rapid writes (simulating production load)...');
    const writePromises = [];
    const startLoad = Date.now();
    
    for (let i = 0; i < 10; i++) {
      writePromises.push(
        LoadTestModel.create({
          data: { test: `load-test-${i}`, value: Math.random() },
          timestamp: new Date()
        })
      );
    }
    
    const results = await Promise.allSettled(writePromises);
    const loadTime = Date.now() - startLoad;
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`   📊 Load test: ${successful}/10 successful in ${loadTime}ms`);
    console.log(`   ⚡ Average per write: ${Math.round(loadTime/10)}ms`);
    
    if (successful < 10) {
      console.error(`   ⚠️  ${10 - successful} writes failed - possible throttling/limits`);
    }
    
    // Cleanup
    await LoadTestModel.deleteMany({ data: { $regex: 'load-test-' } });
    await prodConnection.close();
    
  } catch (error) {
    console.error('❌ Production settings test failed:', error.message);
    
    if (error.message.includes('MongoNetworkTimeoutError')) {
      console.error('🚨 NETWORK TIMEOUT - Possible causes:');
      console.error('   - MongoDB Atlas cluster paused/shut down');
      console.error('   - IP not whitelisted (Network Access)');
      console.error('   - Firewall blocking MongoDB ports');
      console.error('   - Internet connectivity issues');
    }
    
    if (error.message.includes('authentication')) {
      console.error('🚨 AUTHENTICATION ERROR - Possible causes:');
      console.error('   - Wrong username/password in MONGO_URL');
      console.error('   - User doesn\'t have write permissions');
      console.error('   - Database name mismatch');
    }
  }

  console.log('\n🎯 PRODUCTION TROUBLESHOOTING CHECKLIST:');
  console.log('□ MongoDB Atlas cluster status: ACTIVE (not paused)');
  console.log('□ Network Access: 0.0.0.0/0 or production server IP whitelisted');
  console.log('□ Database user: has readWrite permissions');
  console.log('□ Connection limits: not exceeded on Atlas cluster');
  console.log('□ Billing: Atlas account in good standing');
  console.log('□ Environment variables: correct in production');
  console.log('□ Certificate issues: valid SSL certificates');
  console.log('□ Resource limits: sufficient CPU/RAM on production server');
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Run this script in PRODUCTION environment');
  console.log('2. Compare timeout results with development');
  console.log('3. Check MongoDB Atlas dashboard for errors');
  console.log('4. Monitor Atlas cluster metrics during timeouts');
  console.log('5. Review production server logs during timeout periods');
}

checkProductionConfig().catch(error => {
  console.error('\n💥 CRITICAL ERROR in diagnostic:', error);
  process.exit(1);
});