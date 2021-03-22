# README

## SSL Certificate for mobileapp.vdsense.com

root@front-end1:/home/duongbkak55# certbot certonly --manual
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator manual, Installer None
Please enter in your domain name(s) (comma and/or space separated) (Enter 'c'
to cancel): mobileapp.vdsense.com
Obtaining a new certificate
Performing the following challenges:
http-01 challenge for mobileapp.vdsense.com

---

NOTE: The IP of this machine will be publicly logged as having requested this
certificate. If you're running certbot in manual mode on a machine that is not
your server, please ensure you're okay with that.

Are you OK with your IP being logged?

---

(Y)es/(N)o: Y

---

Create a file containing just this data:

d3LQ49IdeOoDSa7JIsUo9Dh40j-ij-FZ3DVR0GKigw0.c1SiIFMDod17V9fw_UCgldti_Ne4GmRxYvinlO2yvkA

And make it available on your web server at this URL:

http://mobileapp.vdsense.com/.well-known/acme-challenge/d3LQ49IdeOoDSa7JIsUo9Dh40j-ij-FZ3DVR0GKigw0

*Need create file in directory "acme-challenge/d3LQ49IdeOoDSa7JIsUo9Dh40j-ij-FZ3DVR0GKigw0" contain "d3LQ49IdeOoDSa7JIsUo9Dh40j-ij-FZ3DVR0GKigw0.c1SiIFMDod17V9fw_UCgldti_Ne4GmRxYvinlO2yvkA". * ***See the Guild***

---

Press Enter to Continue
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:

- Congratulations! Your certificate and chain have been saved at:
  /etc/letsencrypt/live/mobileapp.vdsense.com/fullchain.pem
  Your key file has been saved at:
  /etc/letsencrypt/live/mobileapp.vdsense.com/privkey.pem
  Your cert will expire on 2020-08-05. To obtain a new or tweaked
  version of this certificate in the future, simply run certbot
  again. To non-interactively renew all of your certificates, run
  "certbot renew"
- If you like Certbot, please consider supporting our work by:

  Donating to ISRG / Let's Encrypt: https://letsencrypt.org/donate
  binding_https_port :'8098',
  Donating to EFF: https://eff.org/donate-le

## Guilde

Generate the SSL certificate using Certbot
Now that Certbot is installed, you can invoke it to generate the certificate. You must run this as root:

```bash
certbot certonly --manual
```

…or call sudo:

```bash
sudo certbot certonly --manual
```

This is the process in detail:

The installer will ask you to provide the domain of your website.

…it then asks for your email:

```bash
➜ sudo certbot certonly --manual
Password: XXXXXXXXXXXXXXXXXX
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator manual, Installer None
Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): flavio@flaviocopes.com
…and to accept the ToS:
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must
agree in order to register with the ACME server at
https://acme-v02.api.letsencrypt.org/directory

(A)gree/(C)ancel: A
…and for permission to share your email address:

Would you be willing to share your email address with the Electronic Frontier
Foundation, a founding partner of the Let's Encrypt project and the non-profit
organization that develops Certbot? We'd like to send you email about our work
encrypting the web, EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: Y
```

…finally, we can enter the domain where we want to use the SSL certificate:

```bash
Please enter in your domain name(s) (comma and/or space separated)  (Enter 'c'
to cancel): copesflavio.com
…the installer asks if it’s ok to log your IP address:

Obtaining a new certificate
Performing the following challenges:
http-01 challenge for copesflavio.com

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NOTE: The IP of this machine will be publicly logged as having requested this
certificate. If you're running certbot in manual mode on a machine that is not
your server, please ensure you're okay with that.

Are you OK with your IP being logged?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: y
```

…and finally we get to the verification phase!

```bash
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Create a file containing just this data:

TS_oZ2-ji23jrio3j2irj3iroj_U51u1o0x7rrDY2E.1DzOo_voCOsrpddP_2kpoek2opeko2pke-UAPb21sW1c

And make it available on your web server at this URL:

http://copesflavio.com/.well-known/acme-challenge/TS_oZ2-ji23jrio3j2irj3iroj_U51u1o0x7rrDY2E

```

Now, let’s leave Certbot alone for a couple of minutes.

We need to verify we own the domain, by creating a file named TS_oZ2-ji23jrio3j2irj3iroj_U51u1o0x7rrDY2E in the .well-known/acme-challenge/ folder. Pay attention! The weird string I just pasted will change every single time you go through this process.

You’ll need to create the folder and the file, since they do not exist by default.

In this file you need to put the content that Certbot printed:

```bash
TS_oZ2-ji23jrio3j2irj3iroj_U51u1o0x7rrDY2E.1DzOo_voCOsrpddP_2kpoek2opeko2pke-UAPb21sW1c
```

As for the filename - this string is unique each time you run Certbot.

Allow Express to serve static files
In order to serve that file from Express, you need to enable serving static files. You can create a static folder, and add there the .well-known subfolder, then configure Express like this:

```bash
const express = require('express')
const app = express()

//...

app.use(express.static(__dirname + '/static', { dotfiles: 'allow' } ))

//...
```

The dotfiles option is mandatory otherwise .well-known, which is a dotfile (as it starts with a dot), won’t be made visible. This is a security measure, because dotfiles can contain sensitive information and they are better-off preserved by default.

Confirm the domain
Now run the application and make sure the file is reachable from the public internet. Go back to Certbot, which is still running, and press ENTER to go on with the script.

Obtain the certificate
That’s it! If all went well, Certbot created the certificate and the private key, and made them available in a folder on your computer (and it will tell you which folder, of course).

Now, simply copy/paste the paths into your application to start using them to serve your requests:

```bash
const fs = require('fs')
const https = require('https')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello HTTPS!')
})

https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/path/to/key.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/path/to/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/path/to/chain.pem')
}, app).listen(443, () => {
  console.log('Listening...')
})
```

Note that I made this server listen on port 443, so it needs to be run with root permissions.

Also, the server is exclusively running in HTTPS, because I used https.createServer(). You can also deploy an HTTP server alongside this, by running:

```bash
http.createServer(app).listen(80, () => {
  console.log('Listening...')
})

https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/path/to/key.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/path/to/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/path/to/chain.pem')
}, app).listen(443, () => {
  console.log('Listening...')
})
```

Setup the renewal
The SSL certificate is only going to be valid for 90 days, so you need to set up an automated system for renewing it.

How? Using a cron job.

A cron job is a way to run tasks at a specified interval of time. It can be every week, every minute, every month, and so on.

In our case, we’ll run the renewal script twice per day, as recommended in the Certbot documentation.

First, find out the absolute path of certbot on your system. I use type certbot on macOS to get it, and in my case it’s in /usr/local/bin/certbot.

Here’s the script we need to run:

certbot renew

This is the cron job entry:

```bash
0 */12 * * * root /usr/local/bin/certbot renew >/dev/null 2>&1
```

The above says ‘run it every 12 hours, every day: at 00:00 and at 12:00’.

Tip: I generated this line using https://crontab-generator.org/

Add your newly-created script to the system’s crontab using this command:

env EDITOR=pico crontab -e
This opens the pico editor (feel free to substitute with whichever editor you prefer). Simply enter the new script, save, and the cron job is installed.

Once this is done, you can see the list of active cron jobs by running:

```bash
crontab -l
```

Download my free Express.js Handbook, and check out my upcoming Full-Stack JavaScript Bootcamp! A 4-months online training program. Signups open on May 25 2020

## release android

before release: do that to update new react-native code

```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```
