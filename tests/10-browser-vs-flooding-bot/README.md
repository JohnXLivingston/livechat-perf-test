# 10-browser-vs-flooding-bot

In this suite test, we generate a lot of messages using XMPP Bots, and we monitor one browser.

We will also generate some server monitoring, but as the talking bots are using direct XMPP connections, server CPU usage is not very relevant.

## Runs

### 2023-12-18

Here is a [first run of the tests](./results/2023-12-18T17:52:44.194Z/).

The run has:

* one browser
* 1 bot emitting messages every 100ms
* 1 bot emitting messages every 150ms

Plugin version: v8.0.3

```bash
npm run start -- run --test '10-browser-vs-flooding-bot' --server 'server1' --comments 'Runned on server1.'

> livechat-perf-test@0.0.1 start
> npx ts-node ./src/index.ts run --test 10-browser-vs-flooding-bot --server server1 --comments Runned on server1.

Loading server...
Server server1 loaded.
Loading test suite 10-browser-vs-flooding-bot...
Starting test suite...
TestSuite: Preparing results directory and data for run 2023-12-18T17:52:44.194Z
TestSuite (0.000s): Results will be in: /home/john/dev/peertube_stuff/livechat-perf-test/tests/10-browser-vs-flooding-bot/results/2023-12-18T17:52:44.194Z
TestSuite (0.002s): Starting tasks...
Task create_live (0.481s): Creating a new video on channel: 1939
Task create_live (2.308s): The test video is: https://videos.john-livingston.fr/videos/watch/b0fa62a8-3eae-484d-abed-b0f7914e2637
Task create_live (2.308s): Updating the video privacy, and enabling chat
Task T2 (2.514s): Waiting for 1000ms.
Task monitor_server (4.278s): Found following pids on the server: {"peertube":"528586","prosody":"540974","bot":"540976"}
Task T5 (4.293s): Waiting for 1000ms.
Task browser_01 (5.296s): Loading url https://videos.john-livingston.fr/plugins/livechat/router/webchat/room/b0fa62a8-3eae-484d-abed-b0f7914e2637 using puppeteer...
Task browser_01 (5.583s): Browser started with PID 98969
Task browser_01 (7.408s): Will close this chromium instance in 260000ms.
Task T7 (7.408s): Waiting for 5000ms.
Task external_component_bot_1 (12.409s): Openning SSH Tunnel for component port forwarding.
Task external_component_bot_1 (12.411s): Waiting for the tunnel...
Task external_component_bot_1 (13.110s): Tunnel has writtend on stdout, assuming it is started
Task external_component_bot_2 (13.167s): SSH Tunnel for component port forwarding already openned.
Task waiting_for_tests (13.233s): Waiting for 320000ms.
Task external_component_bot_1 (213.167s): Disconnecting the bot...
Task external_component_bot_1 (213.197s): Bot disconnected, closing the ssh tunneling
Task external_component_bot_1 (213.198s): Decrementing SSH Tunnel for component port count.
Task external_component_bot_2 (213.232s): Disconnecting the bot...
Task external_component_bot_2 (213.329s): Bot disconnected, closing the ssh tunneling
Task external_component_bot_2 (213.329s): Decrementing SSH Tunnel for component port count.
Task external_component_bot_2 (213.329s): Killing the SSH Tunnel
Task browser_01 (267.409s): Closing the browser.
Task monitor_server (304.292s): Top closed.
Task delete_current_live (333.266s): Deleting the video b0fa62a8-3eae-484d-abed-b0f7914e2637
TestSuite (333.557s): Waiting all tasks to terminate.
TestSuite (333.560s): Writing results...
Tests finished.
```

Chromium CPU:

![Chromium CPU](./results/2023-12-18T17:52:44.194Z/monitor_chromium.png)

Server CPU:

![ServerCPU](./results/2023-12-18T17:52:44.194Z/monitor_server.png)
