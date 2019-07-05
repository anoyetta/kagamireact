# kagami

자신이 입력한 스킬 사이클을 실시간으로 표시해주는 ACT-OverlayPlugin 툴입니다.



#### Usages

- 자신의 딜사이클을 시각적으로 확인할 수 있습니다.
- 딜사이클 영상이나 레이드 시점 영상, 스트리밍에 활용하면 시청자들에게 딜사이클을 한 눈에 보여줄 수 있습니다.

![preview](./mdimages/preview.gif)





## Prerequirements

- [ACT](http://advancedcombattracker.com/download.php)
- [FFXIV_ACT_Plugin](https://github.com/ravahn/FFXIV_ACT_Plugin/releases/latest)
- [OverlayPlugin(hibiyasleep version)](https://github.com/hibiyasleep/OverlayPlugin/releases/latest)

***ACT***와 ***OverlayPlugin***의 설치법은 여기서 다루지 않습니다. 





## Download

- kagami overlay: <https://github.com/anoyetta-academy/kagami/releases/latest>





## Installation

1. 최신 버전의 ***ACT***와 ***OverlayPlugin***을 준비해주십시오.



![install2.png](./mdimages/install2.png)

2. 위의 ***kagami plugin***을 다운받아 ***OverlayPlugin*** 폴더 안에 압축 해제합니다.



![install3.png](./mdimages/install3.png)

3. ACT를 실행해, ***Plugins*** 탭 > ***OverlayPlugin.dll*** 탭의 "***추가***" 버튼으로 "***kagami***"를 추가합니다. (이름은 아무 이름이나 상관 없습니다)



![install4.png](./mdimages/install4.png)

4. 새로 만든 탭을 선택해, ***URL***을 아래 ***Overlay URLs***에서 하나 골라 설정해 주십시오.
5. ***Reload overlay*** 버튼을 누릅니다.



#### Overlay URLs

> `https://ramram1048.github.io/kagamireact/`





## Known Issues

- 첫 실행 시 제대로 동작하지 않는 버그가 있습니다. 
  - ***Reload overlay***버튼을 한 번 더 누르면 해결됩니다. 
- 2개 이상의 스킬을 동시에 읽을 경우, 타임라인에 겹쳐서 표시되는 버그가 있습니다.
- 드물게 같은 스킬이 2번 표시되는 버그가 있습니다.
  - 위의 두 버그는 ***Parse log polling interval***을 10정도로 낮게 설정하면 빈도가 줄어들 수 있습니다.
