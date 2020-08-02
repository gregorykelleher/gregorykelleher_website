---
title: Updating to Caddy 2
date: 17:16 08/02/2020
highlight:
    theme: monokai
taxonomy:
    category: blog
    tag: [caddy, web server, website, update]
---

I've finally bit the bullet and made the long-overdue update to the latest version of Caddy. Read ahead to find out how I made my changes.

![caddy](caddy.svg)

===

Caddy, I should prefix, is an open-source web-server. It posits itself as a straightforward and flexible server for the average joe. In a market 
dominated by heavy-weight behemoths, it's a breath of fresh air to have a real alternative.

And opposed to the likes of Apache and NGINX, Caddy is above all, effortless. As complex as web servers can grow to become, this is particularly helpful.

I've been hosting on Caddy for some years now without a hitch. I've even discussed it before in a [previous article](https://gregorykelleher.com/new_year). That was quite some time ago, and quite a few versions behind too. And since then, I've found myself with a growing need to update to the latest version.

The latest version being [Caddy 2](https://caddyserver.com/v2). Version 2 is a complete overhaul of Caddy and incompatible with the first. With an entirely new
code base written from scratch, it seeks to further enhance.

Besides the differences under the hood, the user-friendly configuration remains the same. Perhaps a little more syntactic sugar and emphasis on the daemon, but still as easy as I remember.

###Reinstallation

One of the primary reasons I chose Caddy at first was the ease of installation. Likewise, this equally makes it especially easy to reinstall. Caddy simply comes as a binary, meaning it's just a matter of swapping out the old for the new.

Following the instructions, I download using:

```bash
echo "deb [trusted=yes] https://apt.fury.io/caddy/ /" \
    | sudo tee -a /etc/apt/sources.list.d/caddy-fury.list
sudo apt update
sudo apt install caddy
```

Like before, I place my Caddy binary under `/usr/local/bin` and ensure ownership belongs to `root`. This prevents other accounts from being able to modify the executable. Whilst `root` owns the binary, I choose to only execute it using non-root accounts by setting the permissions to `755`.

!!! `755` gives `root` read/write/execute permissions for Caddy, but every other user only read and execute.

###Caddy Setup

My config has mostly remained the same, but it's worthwhile running over my setup. For starters, I keep my entire Caddy configuration under a `etc/caddy` directory. Following common practice, I ensure this directory also belongs to a `www-data` group, with `root` as owner.

This enables Caddy with read and write access to the configuration, via the `www-data` group. On Ubuntu, `www-data` is the default user and group for web servers.

```bash
gregory@octavius:/etc/caddy$ ll
total 32
drwxr-xr-x   2 root www-data  4096 Jul 31 17:03 ./
drwxr-xr-x 108 root root     12288 Jul 31 11:58 ../
-rw-r--r--   1 root www-data  1069 Jul 31 23:05 Caddyfile
-rw-r--r--   1 root www-data  1369 Dec 19  2018 Caddyfile.v1
-rw-r--r--   1 root www-data  1904 Jul 31 23:06 common.conf
-rw-r--r--   1 root www-data  1950 Jul 30 22:19 common.conf.v1
```

!!! Above, you can see how I've held onto my previous `Caddyfile.v1` and `common.conf.v1` by appending a `.v1` suffix.

###Common Configuration

My sites share the same settings, so it made sense for me to create a common configuration they could inherit. I call this `common.conf` and import it into the `Caddyfile` for each domain.

For Caddy 2 I've had to make some syntactic changes, but otherwise, it's identical.

The first portion is self-explanatory as Caddy syntax typifies:

```bash
# compression
encode gzip

# port setup for php
php_fastcgi localhost:9000

# serve files to client
file_server

# return denied on 403 status
respond /forbidden 403
```

`fastcgi` has changed to `php_fastcgi` for Caddy 2. Similarly `respond` has replaced the `status` keyword.

I've also added `file server` to spin a static file server when required.

For the `header` portion, I've kept my customised responses. The comments give enough explanation of their purpose:
```bash
# http custom response header
header {

    # Enable cross-site filter (XSS) and tell browser to block detected attacks
    X-XSS-Protection "1; mode=block"

    # Prevent some browsers from MIME-sniffing a response away from the declared Content-Type
    X-Content-Type-Options "nosniff"

    # Disallow the site to be rendered within a frame (clickjacking protection)
    X-Frame-Options "DENY"

    # Referrer Policy
    Referrer-Policy "no-referrer"

    # Remove Server field
    -Server

    # Disable selective browser features and APIs
    Feature-Policy "camera 'none'; geolocation 'none'; microphone 'none'; payment 'none'; speaker 'none'; usb 'none'; battery 'none'"

    # Content Security Policy to force https
    Content-Security-Policy "default-src https: 'unsafe-inline' 'unsafe-eval'"

    # Certificate Transparency Policy Reporting
    Expect-CT "max-age=0, report-uri=\"https://gregory@gregorykelleher.com/.well-known/ct_report\""
}
```

There's a new `header` on the block since my last configuration. `Feature Policy` was introduced recently to provide a mechanism to allow/deny browser features in a document. 

!!! In the [latest working draft](https://www.w3.org/TR/permissions-policy-1/), this experimental header has been renamed to `Permissions-Policy`

I don't have much purpose in setting this header but it's at least somewhat worthwhile doing in order to maintain a reputable score on [securityheaders.com](https://securityheaders.com/).

The syntax follows the following form:

```bash
Feature-Policy: <directive> <allowlist>
```

I'd prefer to blacklist everything by default and whitelist as needed. But at this time of writing, there's no means of defaulting to `none` for every directive, similar to the `Content-Security-Policy` header, i.e.

```bash
Feature-Policy: default "none"
```

There's an [open issue listed](https://github.com/w3c/webappsec-permissions-policy/issues/189) but no fix delivered yet. The only alternative then is to specify each directive in turn, setting each to `none`. It's unnecessarily verbose and the list of directives is likely to grow in time too.

For that reason, I only specify a handful of the most important directives in my configuration.

Moving on, my TLS configuration is the same again. The default Caddy spec is already perfect, so no need to prescribe cipher-suites.

```bash
# tls config
tls gregory@gregorykelleher.com {

    protocols tls1.2 tls1.3

    curves secp521r1 secp384r1 secp256r1 x25519
}
```

Lastly and importantly, I have some exhaustive security configuration settings too. As spelled out below:

```bash
# Security config

# deny all access to these folders
@denied_folders {
    path_regexp /(.git|cache|bin|logs|backups|tests)/.*$
}
rewrite @denied_folders /forbidden

# deny running scripts inside core system folders
@denied_system_scripts {
    path_regexp /(system|vendor)/.*\.(txt|xml|md|html|yaml|php|pl|py|cgi|twig|sh|bat)$
}
rewrite @denied_system_scripts /forbidden

# deny running scripts inside user folder
@denied_user_folder {
    path_regexp /user/.*\.(txt|md|yaml|php|pl|py|cgi|twig|sh|bat)$
}
rewrite @denied_user_folder /forbidden

# deny access to specific files in the root folder
@denied_root_folder {
    path_regexp /(LICENSE.txt|composer.lock|composer.json|nginx.conf|web.config|htaccess.txt|\.htaccess)
}
rewrite @denied_root_folder /forbidden

# Global rewrite
try_files {path} {path}/ /index.php?_url={uri}
```

###Caddyfile

In my `Caddyfile` below, note how I inject the `common.conf` for my domain:

```bash
gregorykelleher.com {
    root * /var/www/gregorykelleher

    # Enable HTTP Strict Transport Security (HSTS) to force clients to always use https
    header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

    # lolz
    header X-Custom-Header "No one expects the Spanish Inquisition!"

    #import common configurations
    import common.conf
}

www.gregorykelleher.com {
    # redirect from www
    redir https://gregorykelleher.com
}
```

Cutting down on verbosity aids readability. It also means I get to share the same configuration across all my domains.

###Re-enabling Git integration

Unfortunately with Caddy 2, the excellent plugin ecosystem is no longer compatible. In-built Caddy modules now cover what plugins used to do. That said, there's no `git` integration yet.

In my previous setup, I had a line in my `Caddyfile` that would synchronise to my remote repository:

```bash
# git repository sync
git https://github.com/gregorykelleher/gregorykelleher_website.git
```

Periodically, Caddy would fetch any new changes and reload my live website.

There's work happening to deliver a [new git module](https://github.com/vrongmeal/caddygit) for Caddy 2, but it's still in development.

I felt the best interim solution would be to write a simple script that would essentially do the same thing for me. Inside my `var/www/` directory, I created a
`cron_git_pull.sh` script like so:

```bash
#!/bin/bash

# For every git repository in this directory
# update all branches for remote and prune
# only fast forward merge upstream changes

REPOSITORIES=`pwd`

function git_update()
{
    git remote update -p; git merge --ff-only @{u}
}

for REPO in `ls "$REPOSITORIES/"`; do
    if [ -d "$REPOSITORIES/$REPO/.git" ]
    then
        echo "Updating $REPOSITORIES/$REPO at `date`"
        (cd "${REPO}" && git_update)
    fi
done
```

Instead of doing a regular olde `git pull` I opted to be a little smarter with my `git_update()` function.

The `git remote update` fetches any updates from the remote. The `-p` flag is the `--prune` option. I use `git remote update` over `git pull` for several reasons.

My biggest grievance is that `git pull` tends to fall over unless you're always dealing with fast-forward merges. It could run into a merge conflict and then by default, `git pull` will create a merge commit, which I prefer to avoid.

Using `git remote update -p` will pull all the latest commits from upstream (pruning too) and then `git merge --ff-only @{u}` will fast-forward the local branch to the latest commit on upstream.

If there's no local commits, there's no worry of merge conflicts and it'll return successful. If there is any local work then unlike `git pull` it's not immediately going to drop into a prompt to fix the merge conflict.

###Set up Cron job

Lastly, I'd like to schedule this script with `cron` to periodically fetch any new changes. Inside my root `crontab` I've added a line to execute the script every hour of the day:

```bash
 # git update repositories every hour
 0 * * * * cd /var/www/ && /bin/bash cron_git_pull.sh
 ```

 ###Conclusion

 That about wraps it up. Not much to conclude on, but that at least indicates the update went smoothly. I feel that's down to the inherent simplicity of Caddy. All it took was a swap in of the new binary.

 There were a few minor syntactic changes naturally, but nothing huge. Hopefully the plugin support should mature with time and maybe I'll even get my favourite `git` plugin back!


