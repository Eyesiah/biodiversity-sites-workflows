
import clientPromise from '@/lib/mongodb.js';
import queryBGSAPI from '@/lib/bgs-api.js'
import { MONGODB_DATABASE_NAME } from '@/config';
import { sleep } from "workflow";

async function cacheDataToMongo(endpoint, verb, data) {

  const client = await clientPromise;
  const db = client.db(MONGODB_DATABASE_NAME);
  const cache = db.collection('bgs-register-cache');
 
  const cacheKey = { endpoint: endpoint, verb: verb };
  await cache.updateOne(
    cacheKey,
    {
      $set: {
        data: data,
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
}

async function fetchAndCacheData(endpoint, verb = 'POST') {
  "use step"; 

  console.log(`Fetching ${endpoint}`);
  const data = await queryBGSAPI(endpoint, verb);
  console.log(`Caching ${endpoint}`);
  await cacheDataToMongo(endpoint, verb, data);
  return data;
}

fetchAndCacheData.maxRetries = 5;

export async function cacheRegister() {
 "use workflow"; 

  const siteList = await fetchAndCacheData(`search`);
  
  const allRefNos = siteList.filter(site => !site.referenceNumber.includes(' ')).map(site => site.referenceNumber);
  await sleep("1s");
 
  for (const referenceNumber of allRefNos) {
    await fetchAndCacheData(`search/${referenceNumber}`, 'GET');
    await sleep("1s");
  }
  
 console.log("Workflow is complete! Run 'npx workflow web' to inspect your run")
}