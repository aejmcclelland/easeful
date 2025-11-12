
### Easeful is just you testing (very low traffic) and images are served directly from Cloudinary, then hosting your Vite build on S3 + CloudFront should cost £0/month in practice and sit miles under the “Always Free” allowances you pasted.

##Here’s how to reason about it:

##What actually counts toward CloudFront costs
•Counts: bytes and requests served by CloudFront (your HTML, JS, CSS, small JSON/API responses if you front them with CF).
•Doesn’t count: Cloudinary images if you embed Cloudinary URLs directly in your app (the browser pulls those from Cloudinary’s CDN, not CloudFront). Those bytes are billed by Cloudinary, not AWS.
•Also doesn’t count: your API if it’s on API Gateway/Lambda without CloudFront in front of it (requests/egress are billed by API Gateway/Lambda, which are also tiny for one user).

##Reality check with concrete numbers

Let’s be pessimistic and still conservative:
•Page view: 1 HTML (~5–20 KB), 1 JS bundle (~150–500 KB after min+gzip/brotli), 1 CSS (~20–60 KB), a couple of small JSON calls (~5–20 KB each).
•Per view total (no images): ~250–700 KB (call it 0.5 MB on average).
•Your usage: say 500 views/month (more than one a day while tinkering).
•Data out: 500 × 0.5 MB = 250 MB/month (0.25 GB).
•Requests: suppose ~10 requests per view → ~5,000 requests/month.

##Now compare to the Always Free figures you pasted:
1 TB data transfer out free vs your 0.25 GB → you’re at 0.025% of the allowance.
10,000,000 requests free vs your 5,000 → you’re at 0.05% of the allowance.

##Even if you doubled or tripled that, you’d still be deep in the free bucket.

##Edge compute (CloudFront Functions / Lambda@Edge)
•You don’t need them for a basic SPA. Let CloudFront just cache and serve static files.
•If you do add a tiny Function (e.g., redirect), the free Function invocations you pasted are enormous relative to your traffic.
•Avoid Lambda@Edge unless you truly need it (there’s no free tier there; and you likely don’t need it).

Cloudinary impact
•Using Cloudinary URLs (with f_auto,q_auto,w=...) means images are delivered by Cloudinary’s CDN, not CloudFront.
•So CloudFront sees zero image bytes.
•Cloudinary will count those requests/bandwidth on their side, but for low personal testing this is typically well within their free/dev tier.

Safe setup checklist (cost-aware)
•Host SPA on S3; serve via CloudFront.
•Set a long cache TTL for hashed assets (/assets/app.hash.js), and a short TTL for index.html.
•Use Brotli/gzip (Vite/Vercel build outputs will already be small).
•Keep images as Cloudinary URLs.
•Add an AWS Budget alert (e.g., £1) and enable billing emails.
	•Tag resources (Project=Easeful) so you can audit usage later.

Bottom line

For the usage you described:
	•	CloudFront data + request usage will be far under the Always Free limits you pasted.
	•	Cloudinary traffic won’t touch CloudFront.
	•	Your monthly AWS cost for S3 + CloudFront hosting of the SPA should effectively be £0.

If you want, I can give you a tiny S3+CloudFront deploy script (CLI), recommended cache policies for a SPA (including SPA fallback to index.html), and a minimal “cost guardrails” setup (budget + tags) you can drop in right away.