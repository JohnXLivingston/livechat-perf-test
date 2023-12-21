# 11-browser-vs-flooding-bot-tracing

In this suite test, we use chrome tracing to analyse browser load, with bots generating a lot of messages.

Please find bellow some runs of this test suite.

## 01

Here is a [first run of the tests](./results/01/).

The run has:

* one browser
* 1 bot emitting messages every 1000ms
* 1 bot emitting messages every 150ms (starting 1 second after the first)
* 1 bot emitting messages every 100ms (starting 1 second after the first)

Plugin version: v8.0.3

```bash
npm run start -- run --test '11-browser-vs-flooding-bot-tracing' --server 'server1' --comments 'Runned on server1.' --run-name '01'

> livechat-perf-test@0.0.1 start
> npx ts-node ./src/index.ts run --test 11-browser-vs-flooding-bot-tracing --server server1 --comments Runned on server1. --run-name 01

Loading server...
Server server1 loaded.
Loading test suite 11-browser-vs-flooding-bot-tracing...
Starting test suite...
TestSuite: Preparing results directory and data for run 01
TestSuite (0.000s): Results will be in: /home/john/dev/peertube_stuff/livechat-perf-test/tests/11-browser-vs-flooding-bot-tracing/results/01
TestSuite (0.001s): Starting tasks...
Task create_live (0.534s): Creating a new video on channel: 1939
Task create_live (1.712s): The test video is: https://videos.john-livingston.fr/videos/watch/28fcd8ff-2e11-481e-96ce-9339256f63cb
Task create_live (1.713s): Updating the video privacy, and enabling chat
Task T2 (1.959s): Waiting for 1000ms.
Task browser_01 (2.966s): Loading url https://videos.john-livingston.fr/plugins/livechat/router/webchat/room/28fcd8ff-2e11-481e-96ce-9339256f63cb using puppeteer...
Task browser_01 (3.225s): Browser started with PID 224049
Task browser_01 (5.221s): Will close this chromium instance in 10000ms.
Task T4 (5.221s): Waiting for 2000ms.
Task external_component_bot_1 (7.222s): Openning SSH Tunnel for component port forwarding.
Task external_component_bot_1 (7.229s): Waiting for the tunnel...
Task external_component_bot_1 (7.927s): Tunnel has written on stdout, assuming it is started
Task T6 (7.949s): Waiting for 1000ms.
Task external_component_bot_2 (8.950s): SSH Tunnel for component port forwarding already openned.
Task external_component_bot_3 (9.018s): SSH Tunnel for component port forwarding already openned.
Task waiting_for_tests (9.041s): Waiting for 15000ms.
Task external_component_bot_1 (13.949s): Disconnecting the bot...
Task external_component_bot_1 (13.974s): Bot disconnected, closing the ssh tunneling
Task external_component_bot_1 (13.974s): Decrementing SSH Tunnel for component port count.
Task external_component_bot_2 (14.018s): Disconnecting the bot...
Task external_component_bot_2 (14.030s): Bot disconnected, closing the ssh tunneling
Task external_component_bot_2 (14.031s): Decrementing SSH Tunnel for component port count.
Task external_component_bot_3 (14.041s): Disconnecting the bot...
Task external_component_bot_3 (14.057s): Bot disconnected, closing the ssh tunneling
Task external_component_bot_3 (14.057s): Decrementing SSH Tunnel for component port count.
Task external_component_bot_3 (14.057s): Killing the SSH Tunnel
Task browser_01 (19.681s): Closing the browser.
Task delete_current_live (24.045s): Deleting the video 28fcd8ff-2e11-481e-96ce-9339256f63cb
TestSuite (24.297s): Waiting all tasks to terminate.
TestSuite (24.301s): Writing results...
TestSuite (24.310s): Compressing trace file: browser_01.trace.json
TestSuite (24.748s): Removing original trace file
Tests finished.
```

Here is a chromium trace file for one of the browser used in the test: [trace file](./results/01/browser_01.trace.json.zip).
You can open it on [www.speedscope.app](https://www.speedscope.app/) for example (after unziping it), or loading it in a Chromium browser (open `chrome://tracing/`, and load the zip file).
