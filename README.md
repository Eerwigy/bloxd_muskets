# bloxd_muskets

This is an early verison of a project I am making that aims to create a napoleonic wars type game in Bloxd.io. For best experience use the texture pack. I kindly request that you don't use this on your own server before I have finished making this. When this is finished, there will be a really cool battle event with a lot of players that you wouldn't want to miss, and after that I will publish the game on the bloxd custom games menu so that everyone can play.

You can playtest this at https://bloxd.io/play/classic/bloxd_muskets.

## How to play

Your goal is to capture the other teams camp on the other side of the map. At the center, there is a neutral objective, that if captured, lets you respawn there instead of at camp. There is a morale system put in place to maintain somewhat historical accuracy and to encourage players to play and strategise as a team instead of just one player soloing the whole lobby while the rest of the team doesn't get to do much.

## Morale

Morale is calculated based on your proximity to other teammates and your HP. High morale will let you reload faster and deal more damage, while low morale makes you slower and weaker. To maintain a high morale, it is advised to stay in formation.

## Roles

You will be assigned one of the following at the beginning of a battle.

### Musketeer

This is the default role. You recieve a smoothbore musket which you can use to shoot musketballs or stab enemies with your bayonet.

### Sharpshooter

You recieve a rifled musket. This deals more ranged damage than a smoothbore and is more accurate. Howeevr, you deal less melee damage.

### Grenadier

Grenadiers are elite soldiers. You get the same equipment as musketeers but with a strength bonus. You also get a few handgrenades to disorient the enemy.

### Dragoon

You get a horse and and a cavalry sabre. You can use this to charge the enemy.

### Artillery

You recieve a 4-lb field cannon that can shoot explosive shells. It is very heavy, so you have a slowness debuff. You also get an infantry sabre to defend yourself in close combat.

### Captain

You are the leader of your team. You can order your team to hold position, march, charge or fallback. You have an infantry sabre for melee and a pistol for long range.

## Teams

You can play in teams of 3-15. The role composition changes based on the amount of players:

- 3 Players: 1 Musketeer, 1 Sharpshooter, 1 Captain
- 7 Players: 3 Musketeer, 2 Sharpshooter, 1 Artillery, 1 Captain
- 15 Players: 7 Musketeer, 3 Sharpshooter, 2 Grenadiers, 1 Artillery, 1 Dragoon, 1 Captain

## Texture pack

Use the texture pack to show custom musket and sabre models. If you don't, it would just show the default crossbow and sword.

Here are the steps to use the texture pack.

1. Download the texture pack

Either download the zip file from this website and extract it or clone the repo with:

```sh
git clone https://github.com/Eerwigy/bloxd_muskets.git
```

2. Go to https://bloxd.io
3. Go to Settings > Texture Pack
4. Select "custom"
5. Drag one of the texture pack folders ("Muskets Texture Pack" or "Muskets Texture Pack v2") into the box

Note: "Muskets Texture Pack" is built on top of the default bloxd texture pack while "Muskets Texture Pack v2" is built on top of default2.

6. Click "apply" and reload the page
