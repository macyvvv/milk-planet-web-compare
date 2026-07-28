import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const branchRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imageDirectory = path.join(branchRoot, 'images', 'instagram');
const manifestPath = path.join(branchRoot, 'instagram-snapshot.json');

const shops = [
  {
    shopId: 'milk',
    shopName: 'milk planet',
    account: 'milkplanet_cafe',
    watermark: './images/list_shinjuku.png',
    count: 2,
  },
  {
    shopId: 'cybar-shinjuku',
    shopName: 'CyBARplanet 東京',
    account: 'cybarplanet_jp',
    watermark: './images/list_cp.png',
    count: 2,
  },
  {
    shopId: 'shandy',
    shopName: 'ShandyLove',
    account: 'shandy._.love',
    watermark: './images/list_shandy.png',
    count: 1,
  },
  {
    shopId: 'melty',
    shopName: 'MeltyMousse',
    account: 'melty_mousse',
    watermark: './images/list_melty.png',
    count: 1,
  },
  {
    shopId: 'bloody',
    shopName: 'BloodySugar',
    account: 'bloody__sugar_osaka',
    watermark: './images/list_bloody.png',
    count: 1,
  },
  {
    shopId: 'royal-sugar',
    shopName: 'Royal Sugar',
    account: 'royalsugar_fuk',
    watermark: './images/list_roysuga.png',
    count: 1,
  },
  {
    shopId: 'tweeny',
    shopName: 'TweenyHeartCafe',
    account: 'tweenyheartcafe',
    watermark: './images/list_tweeny.png',
    count: 1,
  },
];

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchProfileMedia(account) {
  const result = spawnSync(
    '/usr/bin/curl',
    [
      '--silent',
      '--show-error',
      '--max-time',
      '20',
      '--header',
      'User-Agent: Instagram 219.0.0.12.117 Android',
      '--header',
      'X-IG-App-ID: 936619743392459',
      `https://www.instagram.com/api/v1/feed/user/${encodeURIComponent(account)}/username/`,
    ],
    { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 },
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0 || !result.stdout) {
    throw new Error(`Profile request failed: ${result.stderr.trim()}`);
  }

  const payload = JSON.parse(result.stdout);
  if (!Array.isArray(payload.items)) {
    throw new Error(payload.message || 'Profile response did not contain posts');
  }

  return payload.items
    .map((item) => ({
      code: item.code,
      mediaId: BigInt(item.pk),
      postType: item.product_type === 'clips' ? 'reel' : 'p',
      imageUrl: item.image_versions2?.candidates?.[0]?.url,
    }))
    .filter((item) => item.code && item.imageUrl)
    .sort((left, right) => {
      if (left.mediaId === right.mediaId) return 0;
      return left.mediaId > right.mediaId ? -1 : 1;
    });
}

async function getLatestMedia(shop) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      console.log(`Scraping @${shop.account} (attempt ${attempt}/3)`);
      const media = await fetchProfileMedia(shop.account);
      if (media.length < shop.count) {
        throw new Error(`Expected ${shop.count} posts, found ${media.length}`);
      }
      return media.slice(0, shop.count);
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(attempt * 8_000);
      }
    }
  }
  throw new Error(`Could not scrape @${shop.account}: ${lastError.message}`);
}

async function downloadJpeg(url, destination) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://www.instagram.com/',
    },
  });
  if (!response.ok) {
    throw new Error(`Image download failed (${response.status}): ${url}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error(`Downloaded image is not JPEG: ${url}`);
  }
  await writeFile(destination, bytes);
}

await mkdir(imageDirectory, { recursive: true });

const snapshot = [];
let imageNumber = 1;
for (const shop of shops) {
  const mediaItems = await getLatestMedia(shop);
  for (const media of mediaItems) {
    const imageFile = `instagram_gallery${imageNumber}.jpg`;
    const postUrl = `https://www.instagram.com/${shop.account}/${media.postType}/${media.code}/`;
    await downloadJpeg(media.imageUrl, path.join(imageDirectory, imageFile));
    snapshot.push({
      shopId: shop.shopId,
      shopName: shop.shopName,
      account: shop.account,
      postType: media.postType,
      postCode: media.code,
      postUrl,
      image: `./images/instagram/${imageFile}`,
      watermark: shop.watermark,
    });
    console.log(`Saved ${imageFile}: ${postUrl}`);
    imageNumber += 1;
  }
  await sleep(4_000);
}

if (snapshot.length !== 9) {
  throw new Error(`Expected 9 snapshot entries, got ${snapshot.length}`);
}

const manifest = {
  capturedAt: new Date().toISOString(),
  source: 'Instagram public profile snapshot',
  posts: snapshot,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${manifestPath}`);
