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
