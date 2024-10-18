const { format } = require('date-fns');
const axios = require('axios');
axios.defaults.headers.common['X-Master-Key'] = process.env.mk;
axios.defaults.headers.put['Content-Type'] = 'application/json';
const storeUrl = 'https://api.jsonbin.io/v3/b/671273d2ad19ca34f8babe7a?meta=false';

let store = null;
const { App, directMention } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.ss,
    signingSecret: process.env.st,
    appToken: process.env.sat,
    socketMode: true
});

app.message(directMention, async ({ message, say, client }) => {
    var date = Date.now();
    var dateKey = format(date, 'dd-MM-yyyy');

    try {
        // say() sends a message to the channel where the event was triggered
        console.log(message);

        var getRes = await axios.get(storeUrl);
        store = getRes.data;

        t = message.text.replace('<@U07T637Q7A4>', '');

        var lines = t.split('\n');
        var succ = true;

        var user = message.user === 'U01UJGWS8FM' ? 'arthur' : 'berni';

        for (line of lines) {
            if (line === '')
                continue;

            var tokens = line.split(' ');
            var time = tokens[0];
            var game = tokens[1].replace(',', '');

            if (!['ts', 'mini', 'bigboi'].includes(game)) {
                console.log(game);
                throw "whoops";
            }

            var timeSegments = time.split(':');
            var totalSeconds = parseInt(timeSegments[0]) * 60 + parseInt(timeSegments[1]);

            if (!store.hasOwnProperty(dateKey))
                store[dateKey] = {};

            if (!store[dateKey].hasOwnProperty(user))
                store[dateKey][user] = {};

            store[dateKey][user][game] = totalSeconds;
        }

        await client.reactions.add({
            channel: message.channel,
            name: 'white_check_mark',  // replace with the emoji name you want to use
            timestamp: message.ts
        });
    } catch (error) {
        console.log(error);
        succ = false;
        await client.reactions.add({
            channel: message.channel,
            name: 'x',  // replace with the emoji name you want to use
            timestamp: message.ts
        });
    }

    //post-save actions
    if (succ) {
        await axios.put(storeUrl, store).then(function (response) { });

        if (store[dateKey].hasOwnProperty('arthur') && store[dateKey].hasOwnProperty('berni')) {
            if (Object.keys(store[dateKey]['arthur']).length === 3 &&
                Object.keys(store[dateKey]['berni']).length === 3) {
                let tsW = store[dateKey]['arthur']['ts'] < store[dateKey]['berni']['ts']
                    ? 'arthur' : 'berni';
                let miniW = store[dateKey]['arthur']['mini'] < store[dateKey]['berni']['mini']
                    ? 'arthur' : 'berni';
                let bigboiW = store[dateKey]['arthur']['bigboi'] < store[dateKey]['berni']['bigboi']
                    ? 'arthur' : 'berni';
                console.log('osted');

                if (tsW === miniW && miniW === bigboiW) {
                    await say(`and the 👏👏👏 goes to ${tsW}!`);
                }
            }
        }

    }
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
})();
