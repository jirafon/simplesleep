const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🎯 REALTIME ENDPOINT DEBUGGING TOOL');
console.log('===================================');
console.log('Para: POST /api/health/data timeout debugging');

const BASE_URL = process.env.API_URL || 'http://localhost:5001';
const ENDPOINT = `${BASE_URL}/api/health/data`;

// Sample data that would come from Android app
const createTestData = (deviceId) => ({
  deviceId: deviceId,
  timestamp: new Date(),
  data: {
    heartRate: 70 + Math.floor(Math.random() * 20),
    bloodPressure: {
      systolic: 110 + Math.floor(Math.random() * 30),
      diastolic: 70 + Math.floor(Math.random() * 20)
    },
    oxygenSaturation: 95 + Math.floor(Math.random() * 5),
    temperature: 36 + Math.random() * 2,
    steps: Math.floor(Math.random() * 15000),
    batteryLevel: Math.floor(Math.random() * 100),
    appVersion: '1.0.0',
    platform: 'Android',
    testTimestamp: Date.now()
  }
});

async function realTimeDebugging() {
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🎯 Target: ${ENDPOINT}`);
  
  // First, check server and MongoDB availability
  try {
    console.log('\n🏥 Pre-flight checks...');
    
    // Health check
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Server health:', healthResponse.data.status);
    
    // MongoDB health check  
    const mongoResponse = await axios.get(`${BASE_URL}/api/health/mongodb`, { timeout: 10000 });
    console.log('✅ MongoDB health:', mongoResponse.data.healthy ? 'HEALTHY' : 'UNHEALTHY');
    
    if (!mongoResponse.data.healthy) {
      console.error('❌ MongoDB not healthy - stopping tests');
      console.error('MongoDB error:', mongoResponse.data.mongodb?.error || 'Unknown');
      return;
    }
    
  } catch (error) {
    console.error('❌ Pre-flight checks failed:', error.message);
    console.error('Server may not be running or accessible');
    return;
  }

  console.log('\n🔄 CONTINUOUS MONITORING MODE');
  console.log('Sending requests every 5 seconds...');
  console.log('Press Ctrl+C to stop\n');

  let requestCount = 0;
  const stats = {
    successful: 0,
    failed: 0,
    timeouts: 0,
    totalTime: 0,
    maxTime: 0,
    minTime: Infinity,
    errors: {}
  };

  const monitoringInterval = setInterval(async () => {
    requestCount++;
    const deviceId = `MONITOR_DEVICE_${String(requestCount).padStart(3, '0')}`;
    const testData = createTestData(deviceId);
    const startTime = Date.now();
    
    console.log(`📡 Request #${requestCount} [${new Date().toISOString()}]`);
    console.log(`   Device: ${deviceId}`);
    
    try {
      // Send request with detailed timing
      const response = await axios.post(ENDPOINT, testData, {
        timeout: 35000, // 35 second timeout
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Siempresalud-Monitor/1.0.0'
        }
      });
      
      const duration = Date.now() - startTime;
      stats.successful++;
      stats.totalTime += duration;
      stats.maxTime = Math.max(stats.maxTime, duration);
      stats.minTime = Math.min(stats.minTime, duration);
      
      console.log(`   ✅ SUCCESS: ${duration}ms`);
      console.log(`   📄 Response: ${response.status} - ${response.data.message}`);
      console.log(`   🆔 Data ID: ${response.data.data_id}`);
      
      if (response.data.debug) {
        console.log(`   🔧 Server timing: ${response.data.debug.duration}`);
        console.log(`   🎫 Request ID: ${response.data.debug.requestId}`);
      }
      
      // Warning for slow responses  
      if (duration > 5000) {
        console.warn(`   ⚠️  SLOW response: ${duration}ms (>5s)`);
      }
      if (duration > 15000) {
        console.error(`   🚨 VERY SLOW response: ${duration}ms (>15s)`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      stats.failed++;
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        stats.timeouts++;
        console.error(`   ❌ TIMEOUT after ${duration}ms`);
        console.error(`   🚨 This confirms the timeout issue!`);
      } else if (error.response) {
        console.error(`   ❌ HTTP ${error.response.status}: ${error.response.statusText}`);
        console.error(`   📄 Server response:`, error.response.data);
      } else if (error.request) {
        console.error(`   ❌ NETWORK ERROR: ${error.message}`);
        console.error(`   🔗 Could not reach server`);
      } else {
        console.error(`   ❌ REQUEST ERROR: ${error.message}`);
      }
      
      // Track error types
      const errorKey = error.code || error.response?.status || 'unknown';
      stats.errors[errorKey] = (stats.errors[errorKey] || 0) + 1;
    }
    
    // Print running statistics
    if (requestCount % 5 === 0) {
      console.log('\n📊 RUNNING STATISTICS:');
      console.log(`   Requests sent: ${requestCount}`);
      console.log(`   Successful: ${stats.successful} (${Math.round(stats.successful/requestCount*100)}%)`);
      console.log(`   Failed: ${stats.failed} (${Math.round(stats.failed/requestCount*100)}%)`);
      console.log(`   Timeouts: ${stats.timeouts} (${Math.round(stats.timeouts/requestCount*100)}%)`);
      
      if (stats.successful > 0) {
        const avgTime = Math.round(stats.totalTime / stats.successful);
        console.log(`   Avg response time: ${avgTime}ms`);
        console.log(`   Min response time: ${stats.minTime}ms`);
        console.log(`   Max response time: ${stats.maxTime}ms`);
      }
      
      if (Object.keys(stats.errors).length > 0) {
        console.log(`   Error breakdown:`, stats.errors);
      }
      console.log('');
    }
    
    // Stop after 20 requests or if too many timeouts
    if (requestCount >= 20 || stats.timeouts >= 5) {
      console.log('\n🛑 Stopping monitoring...');
      clearInterval(monitoringInterval);
      
      console.log('\n📋 FINAL RESULTS:');
      console.log('====================');
      console.log(`Total requests: ${requestCount}`);
      console.log(`Success rate: ${Math.round(stats.successful/requestCount*100)}%`);
      console.log(`Timeout rate: ${Math.round(stats.timeouts/requestCount*100)}%`);
      
      if (stats.timeouts > 0) {
        console.log('\n🚨 TIMEOUT ISSUE CONFIRMED!');
        console.log('Recommendations:');
        console.log('1. Check MongoDB Atlas cluster status');
        console.log('2. Verify Network Access whitelist');
        console.log('3. Monitor Atlas cluster metrics');
        console.log('4. Check production server resources');
        console.log('5. Review connection pool settings');
      } else if (stats.failed > 0) {
        console.log('\n⚠️ Non-timeout errors detected');
        console.log('Error analysis:', stats.errors);
      } else {
        console.log('\n✅ All requests successful - no timeout issue detected');
        console.log('The endpoint appears to be working correctly');
      }
      
      process.exit(0);
    }
    
  }, 5000); // Send request every 5 seconds
  
  // Graceful shutdown on Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitoring stopped by user');
    clearInterval(monitoringInterval);
    console.log('\n📊 Final Statistics:');
    console.log(`Requests: ${requestCount}, Success: ${stats.successful}, Failed: ${stats.failed}, Timeouts: ${stats.timeouts}`);
    process.exit(0);
  });
}

// Start monitoring
console.log('🚀 Starting real-time endpoint monitoring...');
realTimeDebugging();