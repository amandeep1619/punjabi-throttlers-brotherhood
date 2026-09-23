# Deploying to AWS Lightsail (S3 uploads, ~₹1000/month budget)

## What changed

`lib/storage.ts` now writes to S3 instead of local disk (`saveFile`/`deleteFile`
are the only two functions that touch storage — nothing else in the app
changed). It **requires** `AWS_S3_BUCKET` and `AWS_REGION` to be set, and
throws immediately if they're missing — same fail-fast pattern as
`JWT_SECRET`. Verified: with no AWS vars set, every non-upload page (home,
login, rides, members) still works fine; only the 5 upload-touching routes
(`/api/join`, `/api/me/photo`, `/api/manage-rides*`, gallery) 500 until the
bucket exists — they don't crash the server.

External links (YouTube/Instagram/Drive) are unaffected — those never touched
storage.ts.

## Prerequisites — confirm before you start

- [ ] An AWS account (with billing set up).
- [ ] A domain name you own, pointed at the Lightsail instance's static IP
      (an A record). Free HTTPS (Caddy/Let's Encrypt below) needs a real
      domain — it can't issue a cert for a bare IP. **A domain is not part of
      Lightsail/S3 pricing** — if you don't already have one, budget ~$10–15/yr
      (~₹70–110/month) on top of the numbers below.
- [ ] MongoDB Atlas is assumed to still be on the free M0 tier from the
      original build (₹0/month). If you've since upgraded, adjust the budget
      table accordingly.

## 1. Create the S3 bucket + IAM user

```bash
aws s3api create-bucket --bucket YOUR_BUCKET_NAME --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# Allow the bucket policy below to grant public read (keep ACLs off, ACLs
# themselves stay blocked — this is the modern S3-recommended combination)
aws s3api put-public-access-block --bucket YOUR_BUCKET_NAME --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false

# Edit deploy/bucket-policy.json first: replace REPLACE_WITH_BUCKET_NAME with your real bucket name
aws s3api put-bucket-policy --bucket YOUR_BUCKET_NAME --policy file://deploy/bucket-policy.json
```

Then create a **dedicated** IAM user for the app (never use your root
account's keys):

```bash
aws iam create-user --user-name pt-brotherhood-app
# Edit deploy/iam-policy.json first: replace REPLACE_WITH_BUCKET_NAME
aws iam put-user-policy --user-name pt-brotherhood-app \
  --policy-name pt-uploads-only --policy-document file://deploy/iam-policy.json
aws iam create-access-key --user-name pt-brotherhood-app
```

Save the resulting `AccessKeyId`/`SecretAccessKey` — they go into the
server's `.env.local` as `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` (see
`.env.example`). This IAM user can only Put/Get/Delete objects in this one
bucket — nothing else in your AWS account.

(Lightsail instances can't attach an IAM instance role the way EC2 can, which
is why this is a scoped IAM user + static keys rather than a role.)

## 2. Provision the Lightsail instance

- OS: Ubuntu 22.04 LTS (or whatever current LTS Lightsail offers).
- Size: **at least the 1GB RAM tier.** [Guessing] — check
  https://aws.amazon.com/lightsail/pricing/ for current exact tiers/prices,
  they change; don't take the numbers below as locked in. As a floor, Next's
  production server + Mongoose connections + Caddy alongside it need more
  than the smallest (512MB) tier reliably supports — expect OOM restarts
  there under any real traffic.
- Attach the free static IP to the instance.
- Networking (Lightsail firewall): open only **22** (SSH — restrict to your
  own IP if you can), **80**, **443**. Do **not** expose 3000 publicly — only
  Caddy talks to it, over localhost.

## 3. Server setup

```bash
# Node (match your local major version)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g pm2

# Caddy (auto-renewing HTTPS, no certbot cron needed)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Edit `deploy/Caddyfile` with your real domain, then:

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 4. Deploy the app

Building `next build` **on** a 1GB instance risks OOM — build locally (or in
CI) and ship the output instead:

```bash
# locally
npm run build
rsync -avz --exclude node_modules --exclude .git . youruser@YOUR_IP:/home/youruser/app/

# on the server
cd ~/app
npm ci --omit=dev
cp .env.example .env.local   # then fill in real values — MONGODB_URI, JWT_SECRET,
                              # AWS_* from step 1, NEXT_PUBLIC_SITE_URL=https://yourdomain
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # run the command it prints, once, to survive reboots
```

`NODE_ENV=production` (already set in `ecosystem.config.js`) is what flips the
session cookie's `secure` flag on — don't run this in dev mode in production.

## 5. Database backups

Atlas's free M0 tier has **no automated backups** — that's a real gap for
real member PII (emergency contacts, phone numbers). `deploy/backup-db.sh`
dumps the DB nightly into the same S3 bucket under `backups/` and prunes
anything older than 14 days; near-zero extra cost. Install
`mongodb-database-tools` + `awscli` on the instance, then:

```bash
crontab -e
# add:
0 3 * * * /home/youruser/app/deploy/backup-db.sh >> /var/log/pt-backup.log 2>&1
```

## Budget — ₹1000/month

[Guessing] on exact current AWS prices — verify on AWS's pricing pages before
committing, these move over time.

| Item | Est. monthly cost | Notes |
|---|---|---|
| Lightsail instance (1–2GB tier) | ~$5–10 | Floor for reliable Next.js SSR |
| S3 storage + requests | ~$1–3 | Depends heavily on upload volume |
| **S3 data transfer out** | **variable, uncapped** | See risk below |
| MongoDB Atlas M0 | $0 | Free tier, no backups (mitigated above) |
| Domain (if new) | ~$1 (amortized) | Not included in AWS pricing above |
| **Total** | **~$7–14 (~₹580–1160)** | Tight against ₹1000; see mitigation |

**The one thing most likely to blow this budget: video.** Lightsail's
instance price bundles a data-transfer allowance, but **S3 has no bundled
allowance** — every GB a member downloads from an S3-hosted video is billed
separately, uncapped. A few popular ride videos could push this past ₹1000
fast. Mitigation, using a feature the app already has: keep **video** gallery
items as **external links** (YouTube/Instagram/Drive — already a first-class
option in the ride gallery, `source: "external"`) and reserve S3 uploads for
**photos**, which are far smaller and cheaper. Nothing to build — it's just
which button you click in the admin gallery form.

## Go-live checklist

- [ ] Bucket created, policy applied, IAM user's keys in server `.env.local`
- [ ] `npm run build` succeeds locally with real env vars
- [ ] Lightsail instance up, firewall limited to 22/80/443
- [ ] Domain's A record points at the instance's static IP
- [ ] Caddy issues a cert and proxies to `localhost:3000` (visit `https://yourdomain`)
- [ ] `pm2 status` shows the app online; `pm2 startup` configured for reboot survival
- [ ] Test one real upload end-to-end (join form photo) and confirm it renders from the S3 URL
- [ ] Backup cron installed and tested once manually (`./deploy/backup-db.sh`)
- [ ] `npm run seed:admin` run once against production Mongo to create the real first admin
