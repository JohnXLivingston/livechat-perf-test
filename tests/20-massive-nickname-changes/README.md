# 20-massive-nickname-changes

When anonymous users join the Peertube chat, they first get connected using a "Anonymous 12345" nickname.
Before being able to speak, they must change their nickname.

Under certain circumstances (numerous users joining at the same time, when the live begins), this can be the cause of some performance issues in browsers, as ConverseJS will render multiple time per second the user list.

It can also have some cost on the server side.

This test suite will evaluate the proposed fix for issue [#138](https://github.com/JohnXLivingston/peertube-plugin-livechat/issues/138) (hidding some nickname changes, when previous nickname was "Anonymous XXX").

We will also use this test suite to evaluate performance when implementing [#136](https://github.com/JohnXLivingston/peertube-plugin-livechat/issues/136):
grouping anonymous users on a single line for non-moderator users (to avoid having a long anonymous user list).

This test suite will also evaluate the cost when users are joining, and leaving.

This test suite will do:

* create a live
* start a chromium, connected as user_01
* wait a little
* start monitoring the server and chromium
* wait a little
* join the chat with 100 anonymous bots (nickname "Anonymous 1", and so on), at a rate of ~10 bots per second
* after 20 seconds, each bot will change his nickname (for "bot 1", and so on)
* after 50 seconds, bots will leave
* finally we close the chromium, and delete the live

So we should observe some high CPU usage on Chromium, and on the server, at 3 key moments:

* when bots are joining
* when bots are changing nicknames
* when bots are leaving

## 01

Result for running this test suite [on livechat v8.0.4](./results/01/).

Plugin version: v8.0.3

```bash
npm run start -- run --test '20-massive-nickname-changes' -s server1 --comments 'Runned on server1.' --run-name '01'

> livechat-perf-test@0.0.1 start
> npx ts-node ./src/index.ts run --test 20-massive-nickname-changes -s server1 --comments Runned on server1. --run-name 01

Loading server...
Server server1 loaded.
Loading test suite 20-massive-nickname-changes...
Starting test suite...
TestSuite: Preparing results directory and data for run 01
TestSuite (0.000s): Results will be in: /home/john/dev/peertube_stuff/livechat-perf-test/tests/20-massive-nickname-changes/results/01
TestSuite (0.001s): Starting tasks...
Task create_live (0.524s): Creating a new video on channel: 1939
Task create_live (1.743s): The test video is: https://videos.john-livingston.fr/videos/watch/388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task create_live (1.743s): Updating the video privacy, and enabling chat
Task browser_01 (1.885s): Loading url https://videos.john-livingston.fr/plugins/livechat/router/webchat/room/388bd159-a6a6-437a-b587-0fe0bf3ed7ae using puppeteer...
Task browser_01 (2.096s): Browser started with PID 593614
Task browser_01 (3.606s): Will close this chromium instance in 100000ms.
Task T3 (3.606s): Waiting for 4000ms.
Task monitor_server (8.435s): Found following pids on the server: {"peertube":"733512","prosody":"733558","bot":"733560"}
Task T6 (8.456s): Waiting for 5000ms.
Task websocket_anonymous_bot (13.563s): Bot Anonymous 1 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (13.646s): Bot Anonymous 2 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (13.758s): Bot Anonymous 3 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (13.863s): Bot Anonymous 4 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (13.969s): Bot Anonymous 5 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.106s): Bot Anonymous 6 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.186s): Bot Anonymous 7 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.288s): Bot Anonymous 8 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.392s): Bot Anonymous 9 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.530s): Bot Anonymous 10 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.598s): Bot Anonymous 11 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.699s): Bot Anonymous 12 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.805s): Bot Anonymous 13 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (14.926s): Bot Anonymous 14 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.017s): Bot Anonymous 15 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.134s): Bot Anonymous 16 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.224s): Bot Anonymous 17 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.335s): Bot Anonymous 18 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.434s): Bot Anonymous 19 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.547s): Bot Anonymous 20 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.645s): Bot Anonymous 21 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.774s): Bot Anonymous 22 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (15.873s): Bot Anonymous 23 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.002s): Bot Anonymous 24 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.151s): Bot Anonymous 25 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.227s): Bot Anonymous 26 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.308s): Bot Anonymous 27 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.415s): Bot Anonymous 28 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.521s): Bot Anonymous 29 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.654s): Bot Anonymous 30 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.749s): Bot Anonymous 31 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.821s): Bot Anonymous 32 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (16.928s): Bot Anonymous 33 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.043s): Bot Anonymous 34 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.130s): Bot Anonymous 35 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.227s): Bot Anonymous 36 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.345s): Bot Anonymous 37 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.438s): Bot Anonymous 38 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.538s): Bot Anonymous 39 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.631s): Bot Anonymous 40 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.804s): Bot Anonymous 41 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.903s): Bot Anonymous 42 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (17.995s): Bot Anonymous 43 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.071s): Bot Anonymous 44 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.149s): Bot Anonymous 45 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.246s): Bot Anonymous 46 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.369s): Bot Anonymous 47 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.471s): Bot Anonymous 48 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.587s): Bot Anonymous 49 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.676s): Bot Anonymous 50 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.812s): Bot Anonymous 51 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (18.898s): Bot Anonymous 52 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.003s): Bot Anonymous 53 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.096s): Bot Anonymous 54 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.192s): Bot Anonymous 55 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.291s): Bot Anonymous 56 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.443s): Bot Anonymous 57 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.536s): Bot Anonymous 58 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.625s): Bot Anonymous 59 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.720s): Bot Anonymous 60 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.829s): Bot Anonymous 61 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (19.913s): Bot Anonymous 62 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.047s): Bot Anonymous 63 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.134s): Bot Anonymous 64 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.231s): Bot Anonymous 65 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.318s): Bot Anonymous 66 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.455s): Bot Anonymous 67 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.587s): Bot Anonymous 68 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.681s): Bot Anonymous 69 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.768s): Bot Anonymous 70 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.863s): Bot Anonymous 71 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (20.978s): Bot Anonymous 72 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.076s): Bot Anonymous 73 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.183s): Bot Anonymous 74 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.272s): Bot Anonymous 75 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.379s): Bot Anonymous 76 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.471s): Bot Anonymous 77 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.608s): Bot Anonymous 78 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.710s): Bot Anonymous 79 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.838s): Bot Anonymous 80 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (21.938s): Bot Anonymous 81 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.049s): Bot Anonymous 82 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.131s): Bot Anonymous 83 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.216s): Bot Anonymous 84 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.309s): Bot Anonymous 85 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.404s): Bot Anonymous 86 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.505s): Bot Anonymous 87 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.644s): Bot Anonymous 88 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.750s): Bot Anonymous 89 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.865s): Bot Anonymous 90 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (22.979s): Bot Anonymous 91 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (23.055s): Bot Anonymous 92 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (23.139s): Bot Anonymous 93 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (23.241s): Bot Anonymous 94 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (23.352s): Bot Anonymous 95 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (23.457s): Bot Anonymous 96 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (23.566s): Bot Anonymous 97 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (23.677s): Bot Anonymous 98 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (23.812s): Bot Anonymous 99 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task waiting_for_tests (23.868s): Waiting for 100000ms.
Task websocket_anonymous_bot (23.906s): Bot Anonymous 100 joins the room 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
Task websocket_anonymous_bot (33.564s): Bot Anonymous 1 changes nickname for Bot 1
Task websocket_anonymous_bot (33.647s): Bot Anonymous 2 changes nickname for Bot 2
Task websocket_anonymous_bot (33.758s): Bot Anonymous 3 changes nickname for Bot 3
Task websocket_anonymous_bot (33.866s): Bot Anonymous 4 changes nickname for Bot 4
Task websocket_anonymous_bot (33.970s): Bot Anonymous 5 changes nickname for Bot 5
Task websocket_anonymous_bot (34.106s): Bot Anonymous 6 changes nickname for Bot 6
Task websocket_anonymous_bot (34.186s): Bot Anonymous 7 changes nickname for Bot 7
Task websocket_anonymous_bot (34.298s): Bot Anonymous 8 changes nickname for Bot 8
Task websocket_anonymous_bot (34.393s): Bot Anonymous 9 changes nickname for Bot 9
Task websocket_anonymous_bot (34.532s): Bot Anonymous 10 changes nickname for Bot 10
Task websocket_anonymous_bot (34.598s): Bot Anonymous 11 changes nickname for Bot 11
Task websocket_anonymous_bot (34.699s): Bot Anonymous 12 changes nickname for Bot 12
Task websocket_anonymous_bot (34.806s): Bot Anonymous 13 changes nickname for Bot 13
Task websocket_anonymous_bot (34.927s): Bot Anonymous 14 changes nickname for Bot 14
Task websocket_anonymous_bot (35.038s): Bot Anonymous 15 changes nickname for Bot 15
Task websocket_anonymous_bot (35.135s): Bot Anonymous 16 changes nickname for Bot 16
Task websocket_anonymous_bot (35.264s): Bot Anonymous 17 changes nickname for Bot 17
Task websocket_anonymous_bot (35.335s): Bot Anonymous 18 changes nickname for Bot 18
Task websocket_anonymous_bot (35.436s): Bot Anonymous 19 changes nickname for Bot 19
Task websocket_anonymous_bot (35.548s): Bot Anonymous 20 changes nickname for Bot 20
Task websocket_anonymous_bot (35.646s): Bot Anonymous 21 changes nickname for Bot 21
Task websocket_anonymous_bot (35.774s): Bot Anonymous 22 changes nickname for Bot 22
Task websocket_anonymous_bot (35.873s): Bot Anonymous 23 changes nickname for Bot 23
Task websocket_anonymous_bot (36.003s): Bot Anonymous 24 changes nickname for Bot 24
Task websocket_anonymous_bot (36.153s): Bot Anonymous 25 changes nickname for Bot 25
Task websocket_anonymous_bot (36.228s): Bot Anonymous 26 changes nickname for Bot 26
Task websocket_anonymous_bot (36.309s): Bot Anonymous 27 changes nickname for Bot 27
Task websocket_anonymous_bot (36.416s): Bot Anonymous 28 changes nickname for Bot 28
Task websocket_anonymous_bot (36.522s): Bot Anonymous 29 changes nickname for Bot 29
Task websocket_anonymous_bot (36.655s): Bot Anonymous 30 changes nickname for Bot 30
Task websocket_anonymous_bot (36.750s): Bot Anonymous 31 changes nickname for Bot 31
Task websocket_anonymous_bot (36.825s): Bot Anonymous 32 changes nickname for Bot 32
Task websocket_anonymous_bot (36.929s): Bot Anonymous 33 changes nickname for Bot 33
Task websocket_anonymous_bot (37.054s): Bot Anonymous 34 changes nickname for Bot 34
Task websocket_anonymous_bot (37.131s): Bot Anonymous 35 changes nickname for Bot 35
Task websocket_anonymous_bot (37.228s): Bot Anonymous 36 changes nickname for Bot 36
Task websocket_anonymous_bot (37.346s): Bot Anonymous 37 changes nickname for Bot 37
Task websocket_anonymous_bot (37.476s): Bot Anonymous 38 changes nickname for Bot 38
Task websocket_anonymous_bot (37.538s): Bot Anonymous 39 changes nickname for Bot 39
Task websocket_anonymous_bot (37.647s): Bot Anonymous 40 changes nickname for Bot 40
Task websocket_anonymous_bot (37.804s): Bot Anonymous 41 changes nickname for Bot 41
Task websocket_anonymous_bot (37.902s): Bot Anonymous 42 changes nickname for Bot 42
Task websocket_anonymous_bot (37.995s): Bot Anonymous 43 changes nickname for Bot 43
Task websocket_anonymous_bot (38.072s): Bot Anonymous 44 changes nickname for Bot 44
Task websocket_anonymous_bot (38.149s): Bot Anonymous 45 changes nickname for Bot 45
Task websocket_anonymous_bot (38.246s): Bot Anonymous 46 changes nickname for Bot 46
Task websocket_anonymous_bot (38.370s): Bot Anonymous 47 changes nickname for Bot 47
Task websocket_anonymous_bot (38.488s): Bot Anonymous 48 changes nickname for Bot 48
Task websocket_anonymous_bot (38.587s): Bot Anonymous 49 changes nickname for Bot 49
Task websocket_anonymous_bot (38.680s): Bot Anonymous 50 changes nickname for Bot 50
Task websocket_anonymous_bot (38.813s): Bot Anonymous 51 changes nickname for Bot 51
Task websocket_anonymous_bot (38.898s): Bot Anonymous 52 changes nickname for Bot 52
Task websocket_anonymous_bot (39.003s): Bot Anonymous 53 changes nickname for Bot 53
Task websocket_anonymous_bot (39.096s): Bot Anonymous 54 changes nickname for Bot 54
Task websocket_anonymous_bot (39.194s): Bot Anonymous 55 changes nickname for Bot 55
Task websocket_anonymous_bot (39.291s): Bot Anonymous 56 changes nickname for Bot 56
Task websocket_anonymous_bot (39.446s): Bot Anonymous 57 changes nickname for Bot 57
Task websocket_anonymous_bot (39.536s): Bot Anonymous 58 changes nickname for Bot 58
Task websocket_anonymous_bot (39.626s): Bot Anonymous 59 changes nickname for Bot 59
Task websocket_anonymous_bot (39.720s): Bot Anonymous 60 changes nickname for Bot 60
Task websocket_anonymous_bot (39.829s): Bot Anonymous 61 changes nickname for Bot 61
Task websocket_anonymous_bot (39.912s): Bot Anonymous 62 changes nickname for Bot 62
Task websocket_anonymous_bot (40.048s): Bot Anonymous 63 changes nickname for Bot 63
Task websocket_anonymous_bot (40.134s): Bot Anonymous 64 changes nickname for Bot 64
Task websocket_anonymous_bot (40.231s): Bot Anonymous 65 changes nickname for Bot 65
Task websocket_anonymous_bot (40.318s): Bot Anonymous 66 changes nickname for Bot 66
Task websocket_anonymous_bot (40.458s): Bot Anonymous 67 changes nickname for Bot 67
Task websocket_anonymous_bot (40.587s): Bot Anonymous 68 changes nickname for Bot 68
Task websocket_anonymous_bot (40.701s): Bot Anonymous 69 changes nickname for Bot 69
Task websocket_anonymous_bot (40.768s): Bot Anonymous 70 changes nickname for Bot 70
Task websocket_anonymous_bot (40.863s): Bot Anonymous 71 changes nickname for Bot 71
Task websocket_anonymous_bot (40.978s): Bot Anonymous 72 changes nickname for Bot 72
Task websocket_anonymous_bot (41.085s): Bot Anonymous 73 changes nickname for Bot 73
Task websocket_anonymous_bot (41.185s): Bot Anonymous 74 changes nickname for Bot 74
Task websocket_anonymous_bot (41.274s): Bot Anonymous 75 changes nickname for Bot 75
Task websocket_anonymous_bot (41.380s): Bot Anonymous 76 changes nickname for Bot 76
Task websocket_anonymous_bot (41.489s): Bot Anonymous 77 changes nickname for Bot 77
Task websocket_anonymous_bot (41.609s): Bot Anonymous 78 changes nickname for Bot 78
Task websocket_anonymous_bot (41.710s): Bot Anonymous 79 changes nickname for Bot 79
Task websocket_anonymous_bot (41.839s): Bot Anonymous 80 changes nickname for Bot 80
Task websocket_anonymous_bot (41.939s): Bot Anonymous 81 changes nickname for Bot 81
Task websocket_anonymous_bot (42.050s): Bot Anonymous 82 changes nickname for Bot 82
Task websocket_anonymous_bot (42.131s): Bot Anonymous 83 changes nickname for Bot 83
Task websocket_anonymous_bot (42.217s): Bot Anonymous 84 changes nickname for Bot 84
Task websocket_anonymous_bot (42.310s): Bot Anonymous 85 changes nickname for Bot 85
Task websocket_anonymous_bot (42.404s): Bot Anonymous 86 changes nickname for Bot 86
Task websocket_anonymous_bot (42.505s): Bot Anonymous 87 changes nickname for Bot 87
Task websocket_anonymous_bot (42.645s): Bot Anonymous 88 changes nickname for Bot 88
Task websocket_anonymous_bot (42.750s): Bot Anonymous 89 changes nickname for Bot 89
Task websocket_anonymous_bot (42.868s): Bot Anonymous 90 changes nickname for Bot 90
Task websocket_anonymous_bot (42.979s): Bot Anonymous 91 changes nickname for Bot 91
Task websocket_anonymous_bot (43.057s): Bot Anonymous 92 changes nickname for Bot 92
Task websocket_anonymous_bot (43.140s): Bot Anonymous 93 changes nickname for Bot 93
Task websocket_anonymous_bot (43.249s): Bot Anonymous 94 changes nickname for Bot 94
Task websocket_anonymous_bot (43.353s): Bot Anonymous 95 changes nickname for Bot 95
Task websocket_anonymous_bot (43.457s): Bot Anonymous 96 changes nickname for Bot 96
Task websocket_anonymous_bot (43.566s): Bot Anonymous 97 changes nickname for Bot 97
Task websocket_anonymous_bot (43.696s): Bot Anonymous 98 changes nickname for Bot 98
Task websocket_anonymous_bot (43.812s): Bot Anonymous 99 changes nickname for Bot 99
Task websocket_anonymous_bot (43.916s): Bot Anonymous 100 changes nickname for Bot 100
Task websocket_anonymous_bot (73.868s): Disconnecting the bot(s)...
Task websocket_anonymous_bot (73.868s): Disconnecting bot websocket_anonymous_bot_1
Task websocket_anonymous_bot (73.968s): Disconnecting bot websocket_anonymous_bot_2
Task websocket_anonymous_bot (74.068s): Disconnecting bot websocket_anonymous_bot_3
Task websocket_anonymous_bot (74.169s): Disconnecting bot websocket_anonymous_bot_4
Task websocket_anonymous_bot (74.269s): Disconnecting bot websocket_anonymous_bot_5
Task websocket_anonymous_bot (74.370s): Disconnecting bot websocket_anonymous_bot_6
Task websocket_anonymous_bot (74.471s): Disconnecting bot websocket_anonymous_bot_7
Task websocket_anonymous_bot (74.570s): Disconnecting bot websocket_anonymous_bot_8
Task websocket_anonymous_bot (74.670s): Disconnecting bot websocket_anonymous_bot_9
Task websocket_anonymous_bot (74.771s): Disconnecting bot websocket_anonymous_bot_10
Task websocket_anonymous_bot (74.870s): Disconnecting bot websocket_anonymous_bot_11
Task websocket_anonymous_bot (74.971s): Disconnecting bot websocket_anonymous_bot_12
Task websocket_anonymous_bot (75.071s): Disconnecting bot websocket_anonymous_bot_13
Task websocket_anonymous_bot (75.172s): Disconnecting bot websocket_anonymous_bot_14
Task websocket_anonymous_bot (75.272s): Disconnecting bot websocket_anonymous_bot_15
Task websocket_anonymous_bot (75.373s): Disconnecting bot websocket_anonymous_bot_16
Task websocket_anonymous_bot (75.473s): Disconnecting bot websocket_anonymous_bot_17
Task websocket_anonymous_bot (75.573s): Disconnecting bot websocket_anonymous_bot_18
Task websocket_anonymous_bot (75.673s): Disconnecting bot websocket_anonymous_bot_19
Task websocket_anonymous_bot (75.774s): Disconnecting bot websocket_anonymous_bot_20
Task websocket_anonymous_bot (75.875s): Disconnecting bot websocket_anonymous_bot_21
Task websocket_anonymous_bot (75.976s): Disconnecting bot websocket_anonymous_bot_22
Task websocket_anonymous_bot (76.075s): Disconnecting bot websocket_anonymous_bot_23
Task websocket_anonymous_bot (76.175s): Disconnecting bot websocket_anonymous_bot_24
Task websocket_anonymous_bot (76.275s): Disconnecting bot websocket_anonymous_bot_25
Task websocket_anonymous_bot (76.375s): Disconnecting bot websocket_anonymous_bot_26
Task websocket_anonymous_bot (76.476s): Disconnecting bot websocket_anonymous_bot_27
Task websocket_anonymous_bot (76.576s): Disconnecting bot websocket_anonymous_bot_28
Task websocket_anonymous_bot (76.677s): Disconnecting bot websocket_anonymous_bot_29
Task websocket_anonymous_bot (76.776s): Disconnecting bot websocket_anonymous_bot_30
Task websocket_anonymous_bot (76.877s): Disconnecting bot websocket_anonymous_bot_31
Task websocket_anonymous_bot (76.978s): Disconnecting bot websocket_anonymous_bot_32
Task websocket_anonymous_bot (77.078s): Disconnecting bot websocket_anonymous_bot_33
Task websocket_anonymous_bot (77.178s): Disconnecting bot websocket_anonymous_bot_34
Task websocket_anonymous_bot (77.279s): Disconnecting bot websocket_anonymous_bot_35
Task websocket_anonymous_bot (77.380s): Disconnecting bot websocket_anonymous_bot_36
Task websocket_anonymous_bot (77.480s): Disconnecting bot websocket_anonymous_bot_37
Task websocket_anonymous_bot (77.579s): Disconnecting bot websocket_anonymous_bot_38
Task websocket_anonymous_bot (77.680s): Disconnecting bot websocket_anonymous_bot_39
Task websocket_anonymous_bot (77.780s): Disconnecting bot websocket_anonymous_bot_40
Task websocket_anonymous_bot (77.880s): Disconnecting bot websocket_anonymous_bot_41
Task websocket_anonymous_bot (77.980s): Disconnecting bot websocket_anonymous_bot_42
Task websocket_anonymous_bot (78.081s): Disconnecting bot websocket_anonymous_bot_43
Task websocket_anonymous_bot (78.182s): Disconnecting bot websocket_anonymous_bot_44
Task websocket_anonymous_bot (78.282s): Disconnecting bot websocket_anonymous_bot_45
Task websocket_anonymous_bot (78.383s): Disconnecting bot websocket_anonymous_bot_46
Task websocket_anonymous_bot (78.484s): Disconnecting bot websocket_anonymous_bot_47
Task websocket_anonymous_bot (78.584s): Disconnecting bot websocket_anonymous_bot_48
Task websocket_anonymous_bot (78.683s): Disconnecting bot websocket_anonymous_bot_49
Task websocket_anonymous_bot (78.784s): Disconnecting bot websocket_anonymous_bot_50
Task websocket_anonymous_bot (78.885s): Disconnecting bot websocket_anonymous_bot_51
Task websocket_anonymous_bot (78.985s): Disconnecting bot websocket_anonymous_bot_52
Task websocket_anonymous_bot (79.085s): Disconnecting bot websocket_anonymous_bot_53
Task websocket_anonymous_bot (79.186s): Disconnecting bot websocket_anonymous_bot_54
Task websocket_anonymous_bot (79.286s): Disconnecting bot websocket_anonymous_bot_55
Task websocket_anonymous_bot (79.386s): Disconnecting bot websocket_anonymous_bot_56
Task websocket_anonymous_bot (79.487s): Disconnecting bot websocket_anonymous_bot_57
Task websocket_anonymous_bot (79.588s): Disconnecting bot websocket_anonymous_bot_58
Task websocket_anonymous_bot (79.688s): Disconnecting bot websocket_anonymous_bot_59
Task websocket_anonymous_bot (79.788s): Disconnecting bot websocket_anonymous_bot_60
Task websocket_anonymous_bot (79.890s): Disconnecting bot websocket_anonymous_bot_61
Task websocket_anonymous_bot (79.990s): Disconnecting bot websocket_anonymous_bot_62
Task websocket_anonymous_bot (80.091s): Disconnecting bot websocket_anonymous_bot_63
Task websocket_anonymous_bot (80.192s): Disconnecting bot websocket_anonymous_bot_64
Task websocket_anonymous_bot (80.293s): Disconnecting bot websocket_anonymous_bot_65
Task websocket_anonymous_bot (80.393s): Disconnecting bot websocket_anonymous_bot_66
Task websocket_anonymous_bot (80.495s): Disconnecting bot websocket_anonymous_bot_67
Task websocket_anonymous_bot (80.595s): Disconnecting bot websocket_anonymous_bot_68
Task websocket_anonymous_bot (80.696s): Disconnecting bot websocket_anonymous_bot_69
Task websocket_anonymous_bot (80.796s): Disconnecting bot websocket_anonymous_bot_70
Task websocket_anonymous_bot (80.897s): Disconnecting bot websocket_anonymous_bot_71
Task websocket_anonymous_bot (80.997s): Disconnecting bot websocket_anonymous_bot_72
Task websocket_anonymous_bot (81.097s): Disconnecting bot websocket_anonymous_bot_73
Task websocket_anonymous_bot (81.198s): Disconnecting bot websocket_anonymous_bot_74
Task websocket_anonymous_bot (81.298s): Disconnecting bot websocket_anonymous_bot_75
Task websocket_anonymous_bot (81.398s): Disconnecting bot websocket_anonymous_bot_76
Task websocket_anonymous_bot (81.498s): Disconnecting bot websocket_anonymous_bot_77
Task websocket_anonymous_bot (81.599s): Disconnecting bot websocket_anonymous_bot_78
Task websocket_anonymous_bot (81.699s): Disconnecting bot websocket_anonymous_bot_79
Task websocket_anonymous_bot (81.799s): Disconnecting bot websocket_anonymous_bot_80
Task websocket_anonymous_bot (81.899s): Disconnecting bot websocket_anonymous_bot_81
Task websocket_anonymous_bot (81.999s): Disconnecting bot websocket_anonymous_bot_82
Task websocket_anonymous_bot (82.100s): Disconnecting bot websocket_anonymous_bot_83
Task websocket_anonymous_bot (82.201s): Disconnecting bot websocket_anonymous_bot_84
Task websocket_anonymous_bot (82.302s): Disconnecting bot websocket_anonymous_bot_85
Task websocket_anonymous_bot (82.403s): Disconnecting bot websocket_anonymous_bot_86
Task websocket_anonymous_bot (82.503s): Disconnecting bot websocket_anonymous_bot_87
Task websocket_anonymous_bot (82.604s): Disconnecting bot websocket_anonymous_bot_88
Task websocket_anonymous_bot (82.704s): Disconnecting bot websocket_anonymous_bot_89
Task websocket_anonymous_bot (82.804s): Disconnecting bot websocket_anonymous_bot_90
Task websocket_anonymous_bot (82.905s): Disconnecting bot websocket_anonymous_bot_91
Task websocket_anonymous_bot (83.005s): Disconnecting bot websocket_anonymous_bot_92
Task websocket_anonymous_bot (83.105s): Disconnecting bot websocket_anonymous_bot_93
Task websocket_anonymous_bot (83.206s): Disconnecting bot websocket_anonymous_bot_94
Task websocket_anonymous_bot (83.305s): Disconnecting bot websocket_anonymous_bot_95
Task websocket_anonymous_bot (83.406s): Disconnecting bot websocket_anonymous_bot_96
Task websocket_anonymous_bot (83.506s): Disconnecting bot websocket_anonymous_bot_97
Task websocket_anonymous_bot (83.606s): Disconnecting bot websocket_anonymous_bot_98
Task websocket_anonymous_bot (83.706s): Disconnecting bot websocket_anonymous_bot_99
Task websocket_anonymous_bot (83.806s): Disconnecting bot websocket_anonymous_bot_100
Task browser_01 (103.611s): Closing the browser.
Task monitor_server (108.455s): Top closed.
Task delete_current_live (123.877s): Deleting the video 388bd159-a6a6-437a-b587-0fe0bf3ed7ae
TestSuite (124.089s): Waiting all tasks to terminate.
TestSuite (124.090s): Writing results...
Tests finished.
```

Chromium CPU:

![Chromium CPU](./results/01/monitor_chromium.png)

Server CPU:

![ServerCPU](./results/01/monitor_server.png)

### 01 Conclusion

As expected, we can see 3 key moments, where CPU load increase a lot.
Both on the server and on Chromium.
