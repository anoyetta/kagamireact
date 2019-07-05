# kagami

自分が入力したスキル回しをリアルタイムに表示するACT-OverlayPlugin ツールです。



#### Usages

- 自分のスキル回しを視覚的に確認させてもらうことができる
- スキル回しの説明動画や、レイドのPoV動画、放送で使って視聴者にスキル回しを楽に見せる

![preview](./mdimages/preview.gif)





## Prerequirements

- [ACT](http://advancedcombattracker.com/download.php)
- [FFXIV_ACT_Plugin](https://github.com/ravahn/FFXIV_ACT_Plugin/releases/latest)
- [OverlayPlugin(hibiyasleep version)](https://github.com/hibiyasleep/OverlayPlugin/releases/latest)

***ACT***又は***OverlayPlugin***のインストール方法はここで取り扱いません。





## Download

- kagami overlay: <https://github.com/anoyetta-academy/kagami/releases/latest>





## Installation

1. 最新の***ACT***と***OverlayPlugin***を用意してください。



![install2.png](./mdimages/install2.png)

2. 上の***kagami plugin***をダウンロードして、***OverlayPlugin***フォルダの中に解凍します。



![install3.png](./mdimages/install3.png)

3. ACTを開け、***Plugins***タブ > ***OverlayPlugin.dll***タブの「***追加***」ボタンで「***kagami***」を追加します(名前は構いません)。



![install4.png](./mdimages/install4.png)

4. 新しいタブをクリックして、中の***URL***を下にある***Overlay URLs***から一つ選んで設定してください。
5. ***Reload overlay***ボタンを押すことで設定完了です。



#### Overlay URLs

> `https://ramram1048.github.io/kagamireact/`





## Known Issues

- 現在、初起動時に上手く動作しない不具合があります。
  - ***Reload overlay***ボタンをもう一回押すことで直せます。
- 2個以上のアクションが同時に拾われると、タイムラインに重ねてしまう不具合があります。
- まれに同じアクションが2回拾われる不具合があります。
  - 上の2つの不具合は、***Parse log polling interval***を10くらいに低く設定したら頻度を下げることができます。
