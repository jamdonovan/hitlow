
#!/bin/bash

brew upgrade && brew install rclone aria2 tmux ngrok;
#curl -L -s https://bitbucket.org/wahibre/mtn/downloads/mtn-3.4.2-static.tar.gz -o /tmp/build/mtn.tar.gz && tar xf /tmp/build/mtn.tar.gz -C /tmp/build/ && sudo mv /tmp/build/bin/mtn /usr/local/bin/mtn;
#rm -rf /tmp/build;

#mkdir -p /tmp/build;
mkdir -p $HOME/.config/rclone;

npm -g i zx;
chmod +x exec.mjs;
mv exec.mjs $HOME/e.mjs;
echo "alias em=$HOME/e.mjs" >> $HOME/.bash_profile;

cd $HOME;
npm i async;

echo 'PermitRootLogin yes' | sudo tee -a /etc/ssh/sshd_config >/dev/null;
mkdir $HOME/.ssh; echo "$SSH_PUBLIC_KEY" >> $HOME/.ssh/authorized_keys;
sudo launchctl unload /System/Library/LaunchDaemons/ssh.plist;
sudo launchctl load -w /System/Library/LaunchDaemons/ssh.plist;
echo -e "M12345678m\nM12345678m" | sudo passwd "root";

ngrok authtoken $NGROK_TOKEN;
ngrok tcp 22 &>/dev/null &

while true
do
  xxd -l 32 -c 32 -p < /dev/random;
  sleep 5
done
