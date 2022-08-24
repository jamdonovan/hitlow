#!/bin/bash

mkdir -p $HOME/.bin;
echo "export PATH=$PATH:$HOME/.bin" >> $HOME/.bash_profile;

mkdir -p /tmp/build;
mkdir -p $HOME/.config/rclone
sudo apt update && sudo apt install rclone aria2 tmux ffmpeg;
curl -L -s https://bitbucket.org/wahibre/mtn/downloads/mtn-3.4.2-static.tar.gz -o /tmp/build/mtn.tar.gz && tar xf /tmp/build/mtn.tar.gz -C /tmp/build/ && mv /tmp/build/bin/mtn $HOME/.bin/mtn;
rm -rf /tmp/build;

npm -g i zx;
chmod +x exec.mjs;
mv exec.mjs $HOME/e.mjs;
echo "alias ex=$HOME/e.mjs" >> $HOME/.bash_profile;

cd $HOME; 
npm i async;

curl -sO https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz;
sudo tar xvzf ngrok-v3-stable-linux-amd64.tgz -C /usr/local/bin;

mkdir ~/.ssh; echo "$SSH_PUBLIC_KEY" >> ~/.ssh/authorized_keys;
#chmod 755 ~; chmod 600 ~/.ssh/authorized_keys

ngrok authtoken $NGROK_TOKEN;
ngrok tcp 22 &> \dev\null &;

while true
do
    echo "Running ..."
    sleep 10
done
