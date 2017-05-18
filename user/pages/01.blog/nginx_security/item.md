---
title: Migrating to Digital Ocean and securing NGINX
date: 15:43 5/01/2017
author: Gregory Kelleher
highlight:
    theme: monokai
taxonomy:
    category: blog
    tag: [digitalocean, nginx, server, security]
---

My website mightn't look any different, but I've made some major modifications under the hood. Transitioning to Digital Ocean and boosting my security has put this website on the cutting edge of today's web.

![nginx_security.svg](nginx_security.svg)

===

Migrating to Digital Ocean had always been at the back of my mind, but I could never find the time nor the prompt to do so. Prior to transferring, my hosting had been with [Blacknight](https://www.blacknight.com/) (an Irish hosting provider) whose service had always been second-rate; to put it mildly.

In truth, it was time I took my training wheels off and properly configured my own web server. Being my own SysAdmin would grant me full responsibility for my server, enabling me to configure it just the way I wanted. 

[Digital Ocean](https://www.digitalocean.com) was the obvious choice. Besides my €50 in credit, (courtesy of [Github's student pack](https://education.github.com/pack)), it's a hosting platform designed for developers with everything I could ever want.

To anyone uninitiated with Digital Ocean, it's a VPS (virtual private service) provider offering an affordable and straightforward cloud server that's easily customisable. I chose the cheapest option at €5 a month. 

For that price, I essentially get a linux box (or in Digital Ocean's terms, a droplet) installed with Ubuntu 16.04 LTS. It's configured with 512MB memory, 1 core CPU, 20GB SSD with a total of 1TB transfer.

This is more than enough for the handful of websites that I need to run, but let's go back to how things were happening on Blacknight before.

### How things used to look

The real catalyst that spurred the move to Digital Ocean were the results I received after testing my domains on [Qualys SSL Labs](https://www.ssllabs.com/ssltest/). Unsurprisingly, Blacknight's SSL security grade left much to be desired and gave me the desperate nudge I needed.

The screenshot from my test is below, but be warned, the results aren't pretty.

! Note that the results of the following tests are actually from another domain I host since I'd already transferred gregorykelleher.com from Blacknight before I could take screenshots. Although the results below are identical since all my websites shared the exact same configuration on Blacknight.

![blacknight_ssl_test.png](blacknight_ssl_test.png)

At a glance, my website's grade was capped at a 'T' due to the _server's certificate is not being trusted_ error. This is due to the certificate provided by Blacknight being self-signed by parallels.com. Qualys SSL Lab marks it as not being trusted as it doesn't recognise it as a legitimate CA (Certificate Authority).

I suspected parallels.com was self-signing due to the fact that I haven't explicitly requested an SSL certificate for my website. Sure enough, Blacknight has a [page](https://www.blacknight.com/ssl/) where you can purchase SSL certificates.

Since I've multiple websites including sub-domains, I'm in the market for an SSL certificate that supports mutiple domains and multiple sub-domains obviously. Taking a quick glance at the prices listed on the page, it would cost me **€199.99** per annum just to cover this website alone!

Okay, so off to a rocky start with SSL but that's not the end of it. There's still much more that could be improved. As a matter of fact, here's a short list:

| Issue  | Description  			|
| ------ | ------------------------ |
| Certificate 						| Not trusted and uses insecure signature `MD5withRSA`   |
| Forward Secrecy					| Limited browser support and uses a weak key `RSA 1024` |
| Strict Transport Security (HSTS) 	| Not implemented 										 |
| HSTS Preloading 					| No HSTS so hence, no preloading either 				 |
| Public Key Pinning (HPKP) 		| Not implemented 										 |
| Common DH primes 					| Yes, common parameters which is a security risk        |
| EC Support					 	| No support for curves									 |
| Session resumption (caching) 		| No support 											 |
| OSCP Stapling 					| No support 											 |
| HTTP/2 							| No support 											 |
| ALPN and NPN 						| No support 											 |

If the above doesn't make any sense just yet, it's okay. All will be revealed shortly. To put it simply for now, the above are _security enhancements_ that are currently misconfigured, non-supported or just not implemented on Blacknight's server. 

My aim is to fix these issues and enable all these enhancements and more on my own web server. Thereby improving my website's overall security settings and hopefully bumping up my Qualys SSL Lab grade.

But before that, time to look at another excellent website called [securityheaders.io](securityheaders.io) from [Scott Helme](www.scotthelme.co.uk).

!!! Scott Helme is a security researcher and I highly recommend reading his blog that discusses SSL/TLS and the latest in network security. He's the de facto voice on such topics and a lot of what I'll talk about borrows from his work.

His website securityheaders.io analyses the HTTP security headers sent in a response and provides a rating based on the level of protection offered by the sender.

The results for my website hosted on Blacknight exposed the following results:

![security_headers_blacknight.png](security_headers_blacknight.png)

You can't sugarcoat that. It's awful. But at least there's plenty of room for improvement. Again, I'll go into more detail on what each header means when I get to them.

### Setting up Nginx on Digital Ocean

Getting up and running with Nginx is a breeze on Digital Ocean, thanks in part to the excellent documentation that they supply. I won't go into much detail since it's mostly covered by Digital Ocean and a lot of it is good sense. 

For instance, you can assume I set up my SSH keys, turned off `PermitRootLogin` and `PasswordAuthentication`, configured my firewall correctly .etc.

Other such security measures that I took (that mightn't be so familiar) include [Fail2Ban](http://www.fail2ban.org/wiki/index.php/Main_Page) and [tripWire](https://linux.die.net/man/8/tripwire).

Fail2Ban is a piece of software that monitors your log files (e.g. `/var/log/auth.log`) for any dubious attempts to breach the system. 
For instance, if an external host is repeatedly making login attempts on port 22, then fail2Ban will ban that host's IP after a number of login failures.

It's decent protection against the likes of a brute-force attack that might try to flood the system with malicious connections.

TripWire is another useful tool, technically called a _host-based intrusion detection system (HIDS)_ that concerns itself with the system's internals. It sits in the background, observing changes made to the file-system and storing any suspect modifications. It's pretty handy and I've it set to email me if it's ever alerted.

But what about Nginx? Yes, that comes pre-installed on Digital Ocean's Ubuntu droplet thankfully. 

![nginx_directory.png](nginx_directory.png)

For my Nginx setup, I've separated things into different files and directories, allowing me to share configurations between different websites instead of duplicating needlessly.

So for instance, I've placed common configurations I want across all my websites inside `include.d/common.conf`. And then inside `snippets` I have the SSL configurations for each of my sites. Included there is also my very important `ssl-params.conf` file which lists my server's SSL specifications. 

Likewise, inside `ssl-available` I have a config file for each website's server block. I created symbolic links from these files to the `sites-enabled` directory to enable them for Nginx to pick up on.

### gregorykelleher.com.conf

Having this file-based _separation of concerns_ if you will, means I can keep my config file nice and clean.

You can see in my configuration below I've requests to port 80 (HTTP) being redirected with a 301 to my HTTPS-enabled website.

Further down you can see I'm importing other configuration settings by specifying the path; for both the `common.conf` and the SSL `snippet` config files like I mentioned previously. Notice that I'm specifying `http2` for SSL communications on port 443 too.

!!! HTTP/2 is a long overdue update to regular old HTTP. In a nutshell, it's better. It integrates data compression for HTTP headers and multiplexes parallel responses with just a single connection. Although it's only supported on encrypted websites using HTTPS.

```
# Non-SSL configuration - Redirects
server {
listen 80;
root /home/gregory/www/gregorykelleher.com;
server_name gregorykelleher.com www.gregorykelleher.com;
return 301 https://$server_name$request_uri;
}

# Domain - gregorykelleher.com
server {
index index.html index.php;

# Server Info
root /home/gregory/www/gregorykelleher.com;
server_name gregorykelleher.com www.gregorykelleher.com;

# Import common configuration
include /etc/nginx/include.d/common.conf;

# SSL Configuration
listen 443 ssl http2;
include snippets/ssl-gregorykelleher.com.conf;
include snippets/ssl-params.conf;

# HPKP Configuration
add_header Public-Key-Pins 'pin-sha256="fskDdf0qoSQGi08inbU1HLRPLBe6Lx3JCkyU68sujPY="; pin-sha256="GRXBAq6fO82BIgSfurA0VDP2peYUk/EOGekPnqprNlc="; pin-sha256="3oeKWB74UCorXejGwjaHyKYwf53o7MR5Csu+cKogXKg="; max-age=2592000; includeSubDomains';

# PageSpeed
pagespeed on;
pagespeed FileCachePath /home/nginx/ngx_pagespeed_cache;
pagespeed RewriteLevel CoreFilters;
}
```

With the `include snippets/ssl-gregorykelleher.com.conf` I'm importing the paths for my **free** SSL/TLS certificates, courtesy of [Let's Encrypt](https://letsencrypt.org/), which describes itself as a _free, automated, and open Certificate Authority_. 

It's an incredible resource and paired with EFF's [CertBot](https://certbot.eff.org/) daemon, makes certificate deployment a trivial affair. Without it, I'd most likely have to purchase valid certificates from another Certificate Authority at cost.

I'll return to HPKP or _HTTP Public Key Pinning_ later, skipping over it for now. PageSpeed at the bottom is something I'll talk about in a later blog post too.

### snippets/ssl-params.conf

Okay, so this is the most fundamental file for configuring SSL/TLS on Nginx. Like it says, it sets the parameters for the server. Maintaining and upgrading this file will determine the most part of the SSL Lab grade.

```
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:HIGH:MEDIUM:!MD5:!aNULL:!EDH:!RC4:!DSS";
ssl_ecdh_curve X25519:secp521r1:secp384r1;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";
add_header Referrer-Policy "no-referrer";
add_header X-Xss-Protection "1; mode=block" always;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff always;
add_header Content-Security-Policy "default-src 'self' https; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com https://netdna.bootstrapcdn.com https://code.jquery.com https://www.google-analytics.com https://ajax.googleapis.com https://www.gstatic.com https://www.google.com; frame-src https://www.google.com; img-src 'self' https://www.gravatar.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'" always;
ssl_dhparam /etc/ssl/certs/dhparam.pem;
```



