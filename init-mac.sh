
#!/bin/bash

mkdir -p /tmp/build;
mkdir -p $HOME/.config/rclone
brew update && brew install rclone aria2 tmux;
#curl -L -s https://bitbucket.org/wahibre/mtn/downloads/mtn-3.4.2-static.tar.gz -o /tmp/build/mtn.tar.gz && tar xf /tmp/build/mtn.tar.gz -C /tmp/build/ && sudo mv /tmp/build/bin/mtn /usr/local/bin/mtn;
rm -rf /tmp/build;

npm -g i zx;
chmod +x exec.mjs;
mv exec.mjs $HOME/e.mjs;
echo "alias ex=$HOME/e.mjs" >> $HOME/.bash_profile;

cd $HOME; 
npm i async;

curl -sO https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz;
sudo tar xvzf ngrok-v3-stable-linux-arm64.tgz -C /usr/local/bin;

mkdir ~/.ssh; echo "$SSH_PUBLIC_KEY" >> ~/.ssh/authorized_keys;

ngrok authtoken $NGROK_TOKEN &> \dev\null;
ngrok tcp 22 &> \dev\null &

while true
do
  xxd -l 32 -c 32 -p < /dev/random;
  sleep 5
done
