# 30-websocket-vs-c2s

When hundred of users are connected, we can see a huge amount of CPU usage form the Prosody process.
See [issue #178](https://github.com/JohnXLivingston/peertube-plugin-livechat/issues/178) for more information.

I think it is the Websocket and BOSH layer that are very CPU intensive.
To test this hypothesis, here is a test suite that will:

* monitor Prosody CPU usage
* wait 5 seconds
* connect 50 bots using anonymous websocket:
  * connecting 10 bots per seconds
  * each bot will start talking after 10 seconds, 1 messages per seconds, during 10 seconds
  * each bot will disconnect after 25 seconds
* wait some times
* connect 50 bots using c2s (and anonymous users):
  * same conditions as with the Websocket bots

So we will be able to compare the Prosody CPU load between the 2 use cases.

## 01

Result for running this test suite [on livechat v8.0.4](./results/01/).

Plugin version: v8.0.4

See [Run output](./01.output.md).

Server CPU:

![ServerCPU](./results/01/monitor_server.png)

### 01 Conclusion

We can observe:

* little CPU usage when Websocket bots are joining (at 10s)
* ~75% CPU when Websocket bots are talking (between 20s and 45s)
* no particuliar CPU usage when bot are leaving ()