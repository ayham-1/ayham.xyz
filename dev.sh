#!/bin/sh

tmux new-session -s ayhamxyz   -n code -d

tmux new-window  -t ayhamxyz:2 -n run
tmux new-window  -t ayhamxyz:3 -n files
tmux new-window  -t ayhamxyz:4 -n hugo
tmux new-window  -t ayhamxyz:5 -n git

tmux send-keys -t 'code' 'nvim' Enter

tmux send-keys -t 'files' 'man tmux' Enter

tmux send-keys -t 'hugo' 'hugo serve -D' Enter

tmux send-keys -t 'git' 'git log' Enter

tmux select-window -t ayhamxyz:1
tmux -2 attach-session -t ayhamxyz
