# livechat-perf-test

This repository contains some tools to mesure the performance of the Peertube livechat plugin,
so we can mesure impacts of code optimizations.

## Pre-requisites

### Peertube server

You must have a Peertube server that can be used for these tests.

You must also install the following tools:

* a ssh server
* install `nethogs`, and so you can use it without root access: `setcap "cap_net_admin,cap_net_raw,cap_dac_read_search,cap_sys_ptrace+pe" /usr/sbin/nethogs
* install the peertube-cli: `sudo npm install -g @peertube/peertube-cli`
* install the livechat plugin
* set the max concurrent lives to -1 on your instance, and the max per user to -1 (to avoid reaching the limit if you don't delete videos)

You must then create a user on your Peertube instance. This user will be used to create new videos, to test the chat.

Note: for now, monitoring the processes bandwidth is not working. Don't really understand why. The `nethogs` installation is not needed until it works.

### On the computer running the test suite

* NodeJS 18
* ssh client
* ssh access to a user on the Peertube server, correctly setup in your `.ssh/config`
* gnuplot
* zip
* pstree

Clone the repository and install the dependencies:

```bash
git clone git@github.com:JohnXLivingston/livechat-perf-test.git
cd livechat-perf-test
npm install
```

You must also configure your Peertube server by adding a `config/servers.yml` file:

```yaml
servers:
  - name: server1
    domain: videos.server1.tld
    ssh_domain: videos.server1.tld # if given, the domain to use for ssh. If not given, will use domain.
    https: false
    peertube_users:
      - login: test
        password: the_peertube_user_password
        mail: 'john@example.com' # required if we want the user to be created using the 'create-users' command
        key: user_01 # this is optional, and can be used by several tests to find the correct user credentials.
    videos:
      # Some tests need an already existing chat room.
      - key: video_01
        uuid: 'c5d20adf-1088-4d40-bbfc-1abb42d20b05'
```

Note: you can add multiple servers. The first one will be used by default.

## Configure test suites

Create a folder in `tests`, with the wanted name.
Add a `tests/your_test_suite/config.yml` file, with the wanted configuration.

You can check `tests/01-example\config.yml` for an example.

## Run a test suite

```bash
npm run start -- run --test '01-example'
```

## Create test users

If you need several users, you can use the `create-users` command to create users defined in the server's configuration file:

```bash
npm run start -- create-users --server the_server_key
```

Note: if your Peertube instance needs approval for registered users, you must do it yourself after running this script.

Note: if your Peertube instance requires email verification, you must mark them as verified.

Note: the script can fail with "Too many request" responses if you try to create too many users.
In such case, try the '--dont-test-login' option.

There are options to only create specified users.

## Set avatars

You can set avatars to users (usefull to test avatars performances):

```bash
npm run start -- set-users-avatars --server the_server_key
```

This will randomly set avatars to users (if they already have an avatar, it will be ignored).

There are options to only set to specified users.
