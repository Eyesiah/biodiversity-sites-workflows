
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
}

fetchAndCacheData.maxRetries = 5;

async function fetchAndCacheSiteList() {
  "use step"; 

  console.log(`Fetching initial list`);
  const siteList = await queryBGSAPI('search');
  console.log(`Caching initial list`);
  await cacheDataToMongo('search', 'POST', siteList);
  
  const allRefNos = siteList.filter(site => !site.referenceNumber.includes(' ')).map(site => site.referenceNumber);
  return allRefNos;
}


export async function cacheRegister() {
 "use workflow"; 
 
 const allRefNos = await fetchAndCacheSiteList();
  for (const referenceNumber of allRefNos) {
    await fetchAndCacheData(`search/${referenceNumber}`, 'GET');
  }
}