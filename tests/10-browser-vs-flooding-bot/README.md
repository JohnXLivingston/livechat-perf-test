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

#### Conclusion

This tests proves that the lack of message pruning in plugin v8.0.3 cause a bottleneck in the browser: the CPU raise quickly to 100%.

The CPU usage stays at 100% after the bots stop talking (bots stops at 213s, but the CPU continue to work a few seconds).
This can explain [issue #142](https://github.com/JohnXLivingston/peertube-plugin-livechat/issues/142).

### 2023-12-19

[Run result](./results/2023-12-19T14:45:10.797Z/).

The run has:

* one browser
* 1 bot emitting messages every 100ms
* 1 bot emitting messages every 150ms
* 1 bot emitting messages every 1000ms, but who will continue to speak longer

Plugin version: v8.0.3

```bash
npm run start -- run --test '10-browser-vs-flooding-bot' --server 'server1' --comments 'Runned on server1.'

> livechat-perf-test@0.0.1 start
> npx ts-node ./src/index.ts run --test 10-browser-vs-flooding-bot --server server1 --comments Runned on server1.

Loading server...
Server server1 loaded.
Loading test suite 10-browser-vs-flooding-bot...
Starting test suite...
TestSuite: Preparing results directory and data for run 2023-12-19T14:45:10.797Z
TestSuite (0.000s): Results will be in: /home/john/dev/peertube_stuff/livechat-perf-test/tests/10-browser-vs-flooding-bot/results/2023-12-19T14:45:10.797Z
TestSuite (0.001s): Starting tasks...
Task create_live (0.485s): Creating a new video on channel: 1939
Task create_live (1.831s): The test video is: https://videos.john-livingston.fr/videos/watch/04f29ed3-c509-4113-a541-be08fb8b92b9
Task create_live (1.832s): Updating the video privacy, and enabling chat
Task T2 (2.056s): Waiting for 1000ms.
Task monitor_server (3.809s): Found following pids on the server: {"peertube":"528586","prosody":"667304","bot":"667306"}
Task T5 (3.812s): Waiting for 1000ms.
Task browser_01 (4.814s): Loading url https://videos.john-livingston.fr/plugins/livechat/router/webchat/room/04f29ed3-c509-4113-a541-be08fb8b92b9 using puppeteer...
Task browser_01 (5.564s): Browser started with PID 21862
Task browser_01 (7.103s): Will close this chromium instance in 260000ms.
Task T7 (7.103s): Waiting for 5000ms.
Task external_component_bot_1 (12.105s): Openning SSH Tunnel for component port forwarding.
Task external_component_bot_1 (12.108s): Waiting for the tunnel...
Task external_component_bot_1 (12.795s): Tunnel has writtend on stdout, assuming it is started
Task external_component_bot_2 (12.845s): SSH Tunnel for component port forwarding already openned.
Task external_component_bot_3 (12.910s): SSH Tunnel for component port forwarding already openned.
Task waiting_for_tests (12.931s): Waiting for 320000ms.
Task external_component_bot_1 (212.846s): Disconnecting the bot...
Task external_component_bot_1 (212.903s): Bot disconnected, closing the ssh tunneling
Task external_component_bot_1 (212.903s): Decrementing SSH Tunnel for component port count.
Task external_component_bot_2 (212.909s): Disconnecting the bot...
Task external_component_bot_2 (212.927s): Bot disconnected, closing the ssh tunneling
Task external_component_bot_2 (212.927s): Decrementing SSH Tunnel for component port count.
Task external_component_bot_3 (262.930s): Disconnecting the bot...
Task external_component_bot_3 (262.947s): Bot disconnected, closing the ssh tunneling
Task external_component_bot_3 (262.947s): Decrementing SSH Tunnel for component port count.
Task external_component_bot_3 (262.947s): Killing the SSH Tunnel
Task browser_01 (267.104s): Closing the browser.
Task monitor_server (303.813s): Top closed.
Task delete_current_live (332.960s): Deleting the video 04f29ed3-c509-4113-a541-be08fb8b92b9
TestSuite (333.570s): Waiting all tasks to terminate.
TestSuite (333.571s): Writing results...
Tests finished.
```

Chromium CPU:

![Chromium CPU](./results/2023-12-19T14:45:10.797Z/monitor_chromium.png)

Server CPU:

![ServerCPU](./results/2023-12-19T14:45:10.797Z/monitor_server.png)

#### Conclusion

This test proves that when there are a lot of messages, each single new message can cause a huge CPU load (see the CPU usage when only the third bot speaks once a second).

